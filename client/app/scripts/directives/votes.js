
'use strict';
var app = angular.module('instanews.directive.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
  'Comment',
  'Article',
  'Subarticle',
  'UpVote',
  'DownVote',
  'Position',
  function (Comment,
            Article,
            Subarticle,
            UpVote,
            DownVote,
            Position) {

              return {
                restrict: 'E',
                scope: {
                  votable: '='
                },
                controller: function($scope) {

                  var Models = {
                    article: Article,
                    comment: Comment,
                    subarticle: Subarticle
                  };

                  $scope.score = {
                    value: 0
                  };

                  function update(votable) {
                    if(votable.upVotes && votable.upVotes.length > 0) {
                      $scope.votable.upVoted = true;
                      $scope.votable.downVoted = false;
                    }
                    else if(votable.downVotes && votable.downVotes.length > 0) {
                      $scope.votable.downVoted = true;
                      $scope.votable.upVoted = false;
                    }

                    $scope.score.value = Math.round(votable.rating*10000)/100;
                  }

                  update($scope.votable);
                  $scope.$watch(function (scope) {
                    return scope.votable;
                  }, function (newV) {
                    update(newV);
                  });

                  $scope.toggleComments = function() {
                    if(!$scope.votable.showComments) {
                      // istanbul ignore else 
                      if(Models.hasOwnProperty($scope.votable.modelName)) {
                        Models[$scope.votable.modelName].comments({
                          id: $scope.votable.id,
                          filter: {
                            limit: 10,
                            order: 'rating DESC'
                          }
                        }).$promise
                        .then( function (res) {
                          $scope.votable.comments = res;
                          $scope.votable.showComments = true;
                        },
                        // istanbul ignore next
                        function(err) {
                          console.log(err);
                        });
                      }
                      else {
                        console.log('Warning: Unknown modelname!');
                      }
                    }
                    else {
                      $scope.votable.showComments = false;
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
                      $scope.votable.downVotes = [];
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
                      // istanbul ignore  next 
                      function() {
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
                      $scope.votable.upVotes = [];
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
                      // istanbul ignore next 
                      function() {
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
