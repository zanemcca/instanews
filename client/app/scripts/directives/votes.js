
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
  function (
    $timeout,
    Comments,
    UpVote,
    DownVote,
    Votes,
    Navigate,
    Platform,
    Position) {

      return {
        restrict: 'E',
        scope: {
          votable: '='
        },
        controller: function($scope, $location, $timeout) {

          $scope.Platform = Platform;
          $scope.Comments = Comments.findOrCreate($scope.votable.modelName, $scope.votable.id) || {};

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

          $scope.upvote = _.debounce(function () {
            //TODO Move this into the Votes service
            Navigate.ensureLogin( function () {
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
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
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
            });
          }, 500, true);

          $scope.downvote = _.debounce(function () {
            Navigate.ensureLogin( function () {
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
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
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
            });
          }, 500, true);
        },
        templateUrl: 'templates/directives/votes.html'
      };
    }]);
