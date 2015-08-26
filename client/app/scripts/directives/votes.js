
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

        var date = Date.parse($scope.votable.date);
        var age = Date.now() - date; 
        age /= 1000;
        var unit = 'sec';
        if(age > 60) {
          age /= 60;
          unit = 'min';
          if(age > 60) {
            age /= 60;
            unit = 'hr'
            if(age > 24) {
              age /= 24;
              unit = 'day';
              if(age > 7) {
                age /= 7;
                unit = 'week';
                if(age > 52) {
                  age /= 52;
                  unit = 'year';
                }
              }
            }
          }
        }

        $scope.age = {
          age: Math.round(age),
          unit: unit
        };

        $scope.score = Math.round($scope.votable.rating*10000)/10000;

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
             instance.upVoteCount++;
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
                  console.log('Successfully upvoted');
               }, function(err) {
                  console.log('Error: Failed to create an upvote');
               });
            });
         };

         $scope.downvote = function (instance) {
           instance.downVoteCount++;
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
