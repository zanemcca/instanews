
'use strict';
var app = angular.module('instanews.directive.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
  '$timeout',
  'Activity',
  'Articles',
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
    Activity,
    Articles,
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
              Votes.up.find($scope.votable, function(err, votes) {
                if(err) {
                  console.log(err);
                  $scope.votable.upVotes = [];
                }
                if(votes) {
                  $scope.votable.upVotes = votes;
                }
                Votes.down.find($scope.votable, function(err, votes) {
                  if(err) {
                    console.log(err);
                    $scope.votable.downVotes = [];
                  }

                  if(votes) {
                    $scope.votable.downVotes = votes;
                  }

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
              });

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
            Platform.analytics.trackEvent('Share', 'start');
            //TODO Create a browser friendly share sheet and then enable for browser as well
            viewInApp(function () {
              var share = function(parent) {
                Platform.branch.share($scope.votable, function(err, res) {
                  if(err) {
                    if(err.status === 200) {
                      Platform.analytics.trackEvent('Share', 'cancelled');
                    } else {
                      Platform.analytics.trackEvent('Share', 'error');
                      Platform.analytics.trackException(err.message, false);
                    }
                    console.log(err.stack);
                    return;
                  }

                  Activity.activateFeedback();
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
                        Platform.analytics.trackEvent('Share', 'success');
                        if(res) {
                          $scope.votable.shareCount++;
                        }
                        console.log('Successfully shared');
                      }, 
                      // istanbul ignore  next 
                      function(err) {
                        Platform.analytics.trackEvent('Share', 'error');
                        Platform.analytics.trackException((err.message || (err.data && err.data.error)), false);
                        console.log('Error: Failed to create an share');
                        console.log(err);
                      });
                    } else {
                      Platform.analytics.trackEvent('Share', 'success');
                    }
                }, parent);
              };

              if($scope.votable.modelName === 'subarticle') {
                Articles.findById($scope.votable.parentId, share);
              } else {
                share();
              }
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
            Platform.analytics.trackEvent('UpVote', 'start');
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

                      Activity.activateFeedback();
                      Platform.analytics.trackEvent('UpVote', 'success');
                    }, 
                    // istanbul ignore  next 
                    function(err) {
                      console.log('Error: Failed to create an upvote');
                      console.log(err);
                      Platform.analytics.trackEvent('UpVote', 'error');
                    });
                }
              });
            });
          }, 500, true);

          $scope.downvote = _.debounce(function () {
            Platform.analytics.trackEvent('DownVote', 'start');
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
                      Platform.analytics.trackEvent('DownVote', 'success');
                    },
                    // istanbul ignore next 
                    function(err) {
                      console.log('Error: Failed to create an downVote');
                      console.log(err);
                      Platform.analytics.trackEvent('DownVote', 'error');
                    });
                }
              });
            });
          }, 500, true);
        },
        templateUrl: 'templates/directives/votes.html'
      };
    }]);
