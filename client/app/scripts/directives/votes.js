
'use strict';
var app = angular.module('instanews.directive.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
      'Comment',
      'Article',
      'Subarticle',
      'UpVote',
      'DownVote',
      'Position',
      'User',
      function (Comment,
        Article,
        Subarticle,
         UpVote,
         DownVote,
         Position,
         User) {

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

        $scope.score = Math.round($scope.votable.rating*10000)/10000;

        if($scope.votable.upVotes && $scope.votable.upVotes.length > 0) {
          $scope.votable.upVoted = true;
        }
        else if($scope.votable.downVotes && $scope.votable.downVotes.length > 0) {
          $scope.votable.downVoted = true;
        }

         $scope.toggleComments = function() {
            if(!$scope.votable.showComments) {

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
                 }, function(err) {
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
           //TODO Delete the vote if it already exists
           $scope.votable.upVoted = true;
           $scope.votable.downVoted = false;

            Position.getCurrent( function(err,position) {
               var vote = {
                  clickableId: $scope.votable.id,
                  clickableType: $scope.votable.modelName
               };

               if(err) {
                  console.log('Error getting position while upvoting: ' + err);
               }
               else {
                  vote.location = {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                  };
               }

               UpVote.create(vote)
               .$promise
               .then( function(res) {
                  console.log('Successfully upvoted');
               }, function(err) {
                  console.log('Error: Failed to create an upvote');
               });
            });
         };

         $scope.downvote = function () {
           //TODO Delete the vote if it already exists
           $scope.votable.upVoted = false;
           $scope.votable.downVoted = true;

            Position.getCurrent( function(err,position) {
               var vote = {
                  clickableId: $scope.votable.id,
                  clickableType: $scope.votable.modelName
               };

               if(err) {
                  console.log('Error getting position while downvoting: ' + err);
               }
               else {
                  vote.location = {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                  };
               }

               DownVote.create(vote)
               .$promise
               .then( function(res) {
                  console.log('Successfully downVoted');
               }, function(err) {
                  console.log('Error: Failed to create an downVote');
               });
            });
         };
      },
      templateUrl: 'templates/directives/votes.html'
   };
}]);
