
'use strict';
var app = angular.module('instanews.directive.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
      'Comment',
      'UpVote',
      'DownVote',
      'Position',
      'User',
      function (Comment,
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

         $scope.toggleComments = function(instance) {
            if(!instance.showComments) {

               Comment.find({
                  filter: {
                     where: {
                        commentableId: instance.id,
                        commentableType: instance.modelName
                     },
                     limit: 10,
                     order: 'rating DESC'
                  }
               }).$promise
               .then( function (res) {
                  instance.comments = res;
                  instance.showComments = true;
               });

            }
            else {
               instance.showComments = false;
            }
         };


         $scope.upvote = function (instance) {
            var user = User.get();

            Position.getCurrent( function(err,position) {
               var vote = {
                  id: instance.id,
                  username: user.username,
                  votableId: instance.id,
                  votableType: instance.modelName
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
                  instance.upVoteCount = res.upVoteCount;
                  instance.rating = res.rating;
                  if(res.verified) {
                     instance.verified = res.verified;
                  }
               });
            });
         };

         $scope.downvote = function (instance) {
            var user = User.get();

            Position.getCurrent( function(err,position) {
               var vote = {
                  id: instance.id,
                  username: user.username,
                  votableId: instance.id,
                  votableType: instance.modelName
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
                  instance.downVoteCount = res.downVoteCount;
                  instance.rating = res.rating;
               });
            });
         };
      },
      templateUrl: 'templates/directives/votes.html'
   };
}]);
