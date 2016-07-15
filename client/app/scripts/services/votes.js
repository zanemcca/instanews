
'use strict';

var app = angular.module('instanews.service.votes', ['ionic', 'ngResource']);

app.service('Votes', [
  '$q',
  'User',
  'Journalist',
  'list',
  function(
    $q,
    User,
    Journalist,
    list
  ){

    var ogLimit = 1000;

    var filter = {
      limit: ogLimit,
      order: 'id DESC'
    };

    //Order by id descending
    var sortingFunction = function(a,b) {
      if(a.clickableId < b.clickableId) {
        return -1;
      } else if(a.clickableId > b.clickableId) {
        return 1;
      } else {
        return 0;
      }
    };

    /**
     * Wraps find queries for upVotes and downVotes and keeps track of the
     * oldest vote in each
     */
    var findWrapper = function(isUpVote, filter) {
      var q = $q.defer();

      var find = Journalist.downVotes;
      var votes = downVotes;
      if(isUpVote) {
        find = Journalist.upVotes;
        votes = upVotes;
      }

      find(filter).$promise.then(function(res) {
        // Keep track of the oldest vote
        if(res.length && res[res.length -1].id < votes.oldest.id) {
          votes.oldest = res[res.length -1];
        }
        q.resolve(res);
      }, 
      function(err) {
        q.reject(err);
      });

      return {
        $promise: q.promise
      };
    };

    var upSpec = {
      find: findWrapper.bind(findWrapper,true),
      sortingFunction: sortingFunction,
      options: {
        filter: filter
      }
    }; 

    var downSpec = { 
      find: findWrapper.bind(findWrapper, false),
      sortingFunction: sortingFunction,
      options: {
        filter: filter
      }
    };  

    // Create a list for articles within view
    var upVotes = list(upSpec);
    var downVotes = list(downSpec);

    upVotes.oldest = {
      modelName: 'upVote',
      id: 'ffffffffffffffffffffffff'
    };
    downVotes.oldest = {
      modelName: 'downVote',
      id: 'ffffffffffffffffffffffff'
    };

    var user = User.get();

    var updateVotes = function () {
      var usr = User.get();
      // If the user changes in any way then we explicitely clear the votes
      if((!user || !usr || usr.userId !== user.userId)) {
        upVotes.clear();
        downVotes.clear();
        upVotes.oldest = {
          modelName: 'upVote',
          id: 'ffffffffffffffffffffffff'
        };
        downVotes.oldest = {
          modelName: 'downVote',
          id: 'ffffffffffffffffffffffff'
        };
        user = usr;
      }

      // Only reload if we have a user
      if(usr) {
        upSpec.options.id = usr.userId;
        downSpec.options.id = usr.userId;

        downVotes.reload();
        upVotes.reload();
      }
    };

    var findVotes = function (Votes, votable, cb) {
      var user = User.get();
      if(!user) {
        return cb(null, []);
      }

      var search = function () {
        var votes = Votes.get();
        //Binary search over the sorted list of votes (ordered by clickableId)
        var max = votes.length - 1;
        var min = 0;
        var pivot;
        while(min <= max) {
          pivot = Math.floor((max + min)/2);
          if(votes[pivot].clickableId === votable.id) {
            if(votes[pivot].clickableType === votable.modelName) {
              return [votes[pivot]];
            } else {
              console.log('Error: votableId should be globablly unique');
              return [];
            }
          } else if(votes[pivot].clickableId < votable.id) {
            min = pivot + 1;
          } else {
            max = pivot - 1;
          }
        }

        return [];
      };

      var res = search();

      if(!res.length && (votable.id < Votes.oldest.id) && Votes.areItemsAvailable()) { 
        filter.limit = ogLimit;
        filter.skip = Votes.get().length;

        var completeLoad = function() {
          res = search();
          if(!res.length && (votable.id < Votes.oldest.id) && Votes.areItemsAvailable()) {
            console.log('Searching for vote on votable!');
            var find = Journalist.upVotes;
            if(Votes.oldest.modelName === 'downVote') {
              find = Journalist.downVotes;
            }
            find({
              filter: {
                where: {
                  clickableId: votable.id,
                  clickableType: votable.modelName
                }
              },
              id: user.userId
            }).$promise.then(function(res) {
              if(res.length) {
                Votes.add(res);
              }
              cb(null, res);
            }, cb);
          } else {
            cb(null, res);
          }
        };

        if(Votes.loading) {
          Votes.loading.then(function() {
            completeLoad();
          });
        } else {
          var q = $q.defer();
          Votes.loading = q.promise; 
          console.log('Loading more votes!');
          Votes.load(function() {
            q.resolve();
            Votes.loading = null;
            completeLoad();
          });
        }
      } else {
        cb(null, res);
      }
    };

    var remove = function(Votes, votable) {
      Votes.remove(function(vote) {
        return (vote.clickableType === votable.modelName &&
                vote.clickableId === votable.id);
      });
    };

    User.registerObserver(updateVotes);

    updateVotes();

    var up = {
      find: findVotes.bind(findVotes, upVotes),
      registerObserver: upVotes.registerObserver,
      add: upVotes.add,
      reload: upVotes.reload,
      remove: remove.bind(remove, upVotes)
    };

    var down = {
      find: findVotes.bind(findVotes, downVotes),
      registerObserver: downVotes.registerObserver,
      add: downVotes.add,
      reload: downVotes.reload,
      remove: remove.bind(remove, downVotes)
    };

    return {
      up: up,
      down: down
    };
  }
]);
