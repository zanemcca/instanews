
'use strict';
var app = angular.module('instanews.directive.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
  '$timeout',
  'Comment',
  'Article',
  'Subarticle',
  'UpVote',
  'DownVote',
  'Votes',
  'Navigate',
  'Position',
  function (
    $timeout,
    Comment,
    Article,
    Subarticle,
    UpVote,
    DownVote,
    Votes,
    navigate,
    Position) {

      return {
        restrict: 'E',
        scope: {
          votable: '='
        },
        controller: function($scope, $location) {

          var update = function () {
            $timeout(function () {
              $scope.votable.upVotes = Votes.up.find($scope.votable);
              $scope.votable.downVotes = Votes.down.find($scope.votable);

              if($scope.votable.upVotes.length) {
                $scope.votable.upVoted = true;
                $scope.votable.downVoted = false;
              }
              else if($scope.votable.downVotes.length) {
                $scope.votable.downVoted = true;
                $scope.votable.upVoted = false;
              }

              $scope.score.value = Math.round($scope.votable.rating*10000)/100;
            });
          };

          //TODO Remove
          $scope.score = {
            value: 0
          };

          update();
          Votes.up.registerObserver(update);
          Votes.down.registerObserver(update);

          var Navigate;
          var spec = {
            scrollHandle: '',
            $location: $location
          };

          //Get the proper delegate_handle
          if($scope.votable.modelName === 'subarticle') {
            spec.scrollHandle = 'subarticle';
            Navigate = navigate(spec);
          } else if ($scope.votable.modelName === 'article') {
            spec.scrollHandle = 'feed';
            Navigate = navigate(spec);
          } // else comments: Do not zoom in on subcomments


          $scope.toggleComments = function() {
            if(!$scope.votable.showComments) {
              $scope.votable.showComments = true;
            }
            else {
              $scope.votable.showComments = false;
            }
            if(Navigate) {
              Navigate.toggleAnchorScroll($scope.votable.id);
            }
          };

          $scope.upvote = function () {
            if($scope.votable.upVoted) {
              //TODO Delete the vote if it already exists
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
                Votes.up.add(res);
                console.log('Successfully upvoted');
              }, 
              // istanbul ignore  next 
              function(err) {
                console.log('Error: Failed to create an upvote');
                console.log(err);
              });
          };

          $scope.downvote = function () {
            if($scope.votable.downVoted) {
              //TODO Delete the vote if it already exists
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
                Votes.down.add(res);
                console.log('Successfully downVoted');
              },
              // istanbul ignore next 
              function(err) {
                console.log('Error: Failed to create an downVote');
                console.log(err);
              });
          };
        },
        templateUrl: 'templates/directives/votes.html'
      };
    }]);
