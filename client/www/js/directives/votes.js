var app = angular.module('instanews.votes', ['ionic', 'ngResource']);

app.directive('votes', [
      'Comment',
      'Common',
      function (Comment, Common) {

   return {
      restrict: 'E',
      scope: {
         voteable: '='
      },
      controller: function($scope) {
         $scope.Common = Common;

         $scope.upvote = function (instance) {
            //Since comments are nested the constructor actually belongs
            //to the parent model so we have to specifically check for it
            if ( instance.commentableId ) {
               Comment.prototype$__create__upVotes({
                  id: instance.myId,
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
