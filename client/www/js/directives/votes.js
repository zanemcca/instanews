var app = angular.module('instanews.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
      'Comment',
      'Position',
      'User',
      function (Comment,
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

               //Comments can have any kind of parent
               //so we check for it before updating
               if ( instance.commentableId ) {
                  model = Comment;
               }
               else {
                  model = instance.constructor;
               }

               var filter = {
                  limit: 10,
                  order: 'rating DESC'
               }

               //Retrieve the comments from the server
               model.prototype$__get__comments({id: instance.myId, filter: filter})
               .$promise
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
                  id: instance.myId,
                  username: user.username,
                  votableId: instance.myId,
                  votableType: ''
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

               //Since comments are nested the constructor actually belongs
               //to the parent model so we have to specifically check for it
               if ( instance.commentableId ) {
                  vote.votableType = 'comment';

                  Comment.prototype$__create__upVotes(vote)
                  .$promise
                  .then( function(res) {
                     instance.upVoteCount = res.upVoteCount;
                     instance.rating = res.rating;
                     if(res.verified) {
                        instance.verified = res.verified;
                     }
                  });
               }
               else {
                  vote.votableType = instance.constructor.modelName.toLowerCase();

                  instance.constructor.prototype$__create__upVotes(vote)
                  .$promise
                  .then( function(res) {
                     instance.upVoteCount = res.upVoteCount;
                     instance.rating = res.rating;
                     if(res.verified) {
                        instance.verified = res.verified;
                     }
                  });
               }
            });
         };

         $scope.downvote = function (instance) {
            var user = User.get();

            Position.getCurrent( function(err,position) {
               var vote = {
                  id: instance.myId,
                  username: user.username,
                  votableId: instance.myId,
                  votableType: ''
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

               if ( instance.commentableId ) {
                  vote.votableType = "comment";

                  Comment.prototype$__create__downVotes(vote)
                  .$promise
                  .then( function(res) {
                     instance.downVoteCount = res.downVoteCount;
                     instance.rating = res.rating;
                  });
               }
               else {
                  vote.votableType = instance.constructor.modelName.toLowerCase();

                  instance.constructor.prototype$__create__downVotes(vote)
                  .$promise
                  .then( function(res) {
                     instance.downVoteCount = res.downVoteCount;
                     instance.rating = res.rating;
                  });
               }
            });
         };
      },
      templateUrl: 'templates/directives/votes.html'
   };
}]);
