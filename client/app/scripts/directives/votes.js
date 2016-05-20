
'use strict';
var app = angular.module('instanews.directive.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
  '$timeout',
  'Comments',
  'UpVote',
  'DownVote',
  'Votes',
  'Navigate',
  'Platform',
  'Position',
  'Share',
  'Shares',
  'User',
  '_',
  function (
    $timeout,
    Comments,
    UpVote,
    DownVote,
    Votes,
    Navigate,
    Platform,
    Position,
    Share,
    Shares,
    User,
    _
  ) {

      return {
        restrict: 'E',
        scope: {
          votable: '='
        },
        controller: function($scope, $location, $timeout) {

          $scope.Platform = Platform;
          $scope.Comments = Comments.findOrCreate($scope.votable.modelName, $scope.votable.id) || {};
          $scope.votable.shareCount = $scope.votable.shareCount || 0;

          var update = function () {
            $timeout(function () {
              $scope.votable.upVotes = Votes.up.find($scope.votable);
              $scope.votable.downVotes = Votes.down.find($scope.votable);

              if($scope.votable.upVotes.length) {
                $scope.votable.upVoted = true;
                $scope.votable.downVoted = false;
              } else if($scope.votable.downVotes.length) {
                $scope.votable.downVoted = true;
                $scope.votable.upVoted = false;
              } else {
                $scope.votable.downVoted = false;
                $scope.votable.upVoted = false;
              }
            });
          };

          update();
          Votes.up.registerObserver(update);
          Votes.down.registerObserver(update);

          /*
          var Scroll;
          var spec = {
            scrollHandle: '',
            $timeout: $timeout,
            $location: $location
          };

          //Get the proper delegate_handle
          if($scope.votable.modelName === 'subarticle') {
            spec.scrollHandle = 'subarticle';
            Scroll = Navigate.scroll(spec);
          } else if ($scope.votable.modelName === 'article') {
            spec.scrollHandle = 'feed';
            Scroll = Navigate.scroll(spec);
          } // else comments: Do not zoom in on subcomments
         */

          $scope.toggleComments = _.debounce(function() {
            if($scope.Comments.enableFocus) {
              $scope.votable.showComments = false;
              $scope.Comments.unfocusAll();
            } else {
              if(!$scope.votable.showComments) {
                $scope.votable.showComments = true;
              }
              else {
                $scope.votable.showComments = false;
              }
            }

            //TODO Consider removing this as it does not animate/look good
            /*
            if(Scroll) {
              Scroll.toggleAnchorScroll($scope.votable.id);
            }
           */
          }, 500, true);


          $scope.share = _.debounce(function () {
            //TODO Create a browser friendly share sheet and then enable for browser as well
            viewInApp(function () {
              Platform.branch.share($scope.votable, function(err, res) {
                if(err) {
                  console.log(err.stack);
                  return;
                }

                var user = User.get();
                if(user) {

                  var position = Position.getPosition();
                  var share = {
                    sharedUrl: res.sharedLink,
                    targetUrl: res.targetUrl, 
                    channel: res.sharedChannel,
                    clickableId: $scope.votable.id,
                    clickableType: $scope.votable.modelName
                  };

                  // istanbul ignore else 
                  if(position) {
                    share.location = {
                      type: 'Point',
                      coordinates: [ position.coords.longitude, position.coords.latitude]
                    };
                  }

                  Share.create(share)
                  .$promise
                  .then(
                    function(res) {
                      if(res) {
                        $scope.votable.shareCount++;
                      }
                      console.log('Successfully shared');
                    }, 
                    // istanbul ignore  next 
                    function(err) {
                      console.log('Error: Failed to create an share');
                      console.log(err);
                    });
                  }
              });
            });
          }, 500, true);

          var viewInApp = function (cb) {
            var data = {
              focusType: $scope.votable.modelName,
              focusId: $scope.votable.id,
            };
            //data.$deeplink_path = data.focusType + '/' + data.focusId;
            Platform.branch.viewInApp(data, cb);
          };

          $scope.upvote = _.debounce(function () {
            //TODO Move this into the Votes service
            viewInApp(function () {
              Navigate.ensureLogin( function (noLoginNeeded) {
                if(noLoginNeeded) {
                  //TODO Move this into the callback to get rid of negative vote count issue
                  var destroying = false;
                  if($scope.votable.upVoted) {
                    //UpVote.create will toggle the vote if it already exists
                    Votes.up.remove($scope.votable);
                    $scope.votable.upVoteCount--;
                    $scope.votable.upVoted = false;
                    destroying = true;
                  } else {
                    $scope.votable.upVoteCount++;
                    $scope.votable.upVoted = true;
                  }

                  if($scope.votable.downVoted) {
                    Votes.down.remove($scope.votable);
                    $scope.votable.downVoteCount--;
                    $scope.votable.downVoted = false;
                  }

                  var position = Position.getPosition();
                  var vote = {
                    clickableId: $scope.votable.id,
                    clickableType: $scope.votable.modelName
                  };

                  // istanbul ignore else 
                  if(position) {
                    vote.location = {
                      type: 'Point',
                      coordinates: [ position.coords.longitude, position.coords.latitude]
                    };
                  }

                  UpVote.create(vote)
                  .$promise
                  .then(
                    function(res) {
                      if(res && !destroying) {
                        Votes.up.add(res);
                      }
                      console.log('Successfully upvoted');
                      Votes.up.reload();
                      Votes.down.reload();
                    }, 
                    // istanbul ignore  next 
                    function(err) {
                      console.log('Error: Failed to create an upvote');
                      console.log(err);
                    });
                }
              });
            });
          }, 500, true);

          $scope.downvote = _.debounce(function () {
            viewInApp(function () {
              Navigate.ensureLogin( function (noLoginNeeded) {
                if(noLoginNeeded) {
                  var destroying = false;
                  if($scope.votable.downVoted) {
                    //DownVote.create will toggle the vote if it already exists
                    Votes.down.remove($scope.votable);
                    $scope.votable.downVoteCount--;
                    $scope.votable.downVoted = false;
                    destroying = true;
                  } else {
                    $scope.votable.downVoteCount++;
                    $scope.votable.downVoted = true;
                  }

                  if($scope.votable.upVoted) {
                    Votes.up.remove($scope.votable);
                    $scope.votable.upVoteCount--;
                    $scope.votable.upVoted = false;
                  }

                  var position = Position.getPosition();
                  var vote = {
                    clickableId: $scope.votable.id,
                    clickableType: $scope.votable.modelName
                  };

                  // istanbul ignore else 
                  if(position) {
                    vote.location = {
                      type: 'Point',
                      coordinates: [ position.coords.longitude, position.coords.latitude]
                    };
                  }

                  DownVote.create(vote)
                  .$promise
                  .then(
                    function(res) {
                      if(res && !destroying) {
                        Votes.down.add(res);
                      }
                      Votes.up.reload();
                      Votes.down.reload();
                      console.log('Successfully downVoted');
                    },
                    // istanbul ignore next 
                    function(err) {
                      console.log('Error: Failed to create an downVote');
                      console.log(err);
                    });
                }
              });
            });
          }, 500, true);
        },
        templateUrl: 'templates/directives/votes.html'
      };
    }]);
