var app = angular.module('instanews.votes', ['ionic', 'ngResource']);

app.directive('invotes', [
      'Comment',
      'User',
      function (Comment, User) {

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

         var user = User.get();

         var updateUser = function() {
            user = User.get();
         };

         User.registerObserver(updateUser);

         $scope.upvote = function (instance) {
            //Since comments are nested the constructor actually belongs
            //to the parent model so we have to specifically check for it
            if ( instance.commentableId ) {
               Comment.prototype$__create__upVotes({
                  id: instance.myId,
                  username: user.username,
                  votableId: instance.myId,
                  votableType: "comment"
               })
               .$promise
               .then( function(res) {
                  instance.upVoteCount = res.upVoteCount;
                  instance.rating = res.rating;
               });
            }
            else {
               instance.constructor.prototype$__create__upVotes({
                  id: instance.myId,
                  username: user.username,
                  votableId: instance.myId,
                  votableType: instance.constructor.modelName.toLowerCase()
               })
               .$promise
               .then( function(res) {
                  instance.upVoteCount = res.upVoteCount;
                  instance.rating = res.rating;
               });
            }
         };

         $scope.downvote = function (instance) {
            if ( instance.commentableId ) {
               Comment.prototype$__create__downVotes({
                  id: instance.myId,
                  username: user.username,
                  votableId: instance.myId,
                  votableType: "comment"
               })
               .$promise
               .then( function(res) {
                  instance.downVoteCount = res.downVoteCount;
                  instance.rating = res.rating;
               });
            }
            else {
               instance.constructor.prototype$__create__downVotes({
                  id: instance.myId,
                  username: user.username,
                  votableId: instance.myId,
                  votableType: instance.constructor.modelName.toLowerCase()
               })
               .$promise
               .then( function(res) {
                  instance.downVoteCount = res.downVoteCount;
                  instance.rating = res.rating;
               });
            }
         };
      },
      templateUrl: 'templates/directives/votes.html'
   };
}]);
