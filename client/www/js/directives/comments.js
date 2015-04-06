var app = angular.module('instanews.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
      'Common',
      'Comment',
      function (Common, Comment) {

   return {
      restrict: 'E',
      scope: {
         owner: '='
      },
      controller: function($scope) {
         $scope.Common = Common;

         var filter = {
            limit: 10,
            skip: 0,
            order: 'rating DESC'
         }

         $scope.loadMore = function(instance) {
            //Comments can have any kind of parent
            //so we check for it before updating
            if ( instance.commentableId ) {
               model = Comment;
               filter.order = 'date DESC';
            }
            else {
               model = instance.constructor;
               filter.order = 'rating DESC';
            }

            filter.skip = instance.comments.length;

            //Retrieve the comments from the server
            model.prototype$__get__comments({id: instance.myId, filter: filter})
            .$promise
            .then( function (comments) {

               //Remove duplicates
               for( var i = 0; i < comments.length; i++) {
                  for( var j = 0; j < instance.comments.length; j++) {
                     var comment = instance.comments[j];
                     if( comment.myId === comments[i].myId) {
                        comments.splice(i,1);
                        break;
                     }
                  }
               }
               //Concatinate the new comments
               instance.comments = instance.comments.concat(comments);
            });
         };
      },
      templateUrl: 'templates/directives/comments.html'
   };
}]);
