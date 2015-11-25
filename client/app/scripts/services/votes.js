
'use strict';

var app = angular.module('instanews.service.votes', ['ionic', 'ngResource']);

app.service('Votes', [
  'User',
  'Journalist',
  'list',
  function(
    User,
    Journalist,
    list
  ){

    var filter = {
      limit: 1000,
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

    var upSpec = {
      find: Journalist.upVotes,
      sortingFunction: sortingFunction,
      options: {
        filter: filter
      }
    };

    var downSpec = { 
      find: Journalist.downVotes,
      sortingFunction: sortingFunction,
      options: {
        filter: filter
      }
    };

    // Create a list for articles within view
    var upVotes = list(upSpec);
    var downVotes = list(downSpec);

    var updateVotes = function () {
      downVotes.clear();
      upVotes.clear();
      var user = User.get();
      if(user) {
        upSpec.options.id = user.userId; 
        downSpec.options.id = user.userId; 
        downVotes.load();
        upVotes.load();
      }
    };

    var findVotes = function (Votes, votable) {
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
            break;
          }
        } else if(votes[pivot].clickableId < votable.id) {
          min = pivot + 1;
        } else {
          max = pivot - 1;
        }
      }

      return [];
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
      remove: remove.bind(remove, upVotes)
    };

    var down = {
      find: findVotes.bind(findVotes, downVotes),
      registerObserver: downVotes.registerObserver,
      add: downVotes.add,
      remove: remove.bind(remove, downVotes)
    };

    return {
      up: up,
      down: down
    };
  }
]);
