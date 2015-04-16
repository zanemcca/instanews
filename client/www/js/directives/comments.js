var app = angular.module('instanews.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
      'User',
      'Comment',
      function (User, Comment) {

   return {
      restrict: 'E',
      scope: {
         owner: '='
      },
      controller: function($scope) {

         $scope.createComment = function (instance, content) {
            var Create = {};
            var model = {};
            var user = User.get();
            if (instance.commentableId ) {
               Create = Comment.prototype$__create__comments;
               model = {
                  id: instance.myId,
                  username: user.username,
                  content: content,
                  commentableId: instance.myId,
                  commentableType: "comment"
               };
            }
            else {
               Create = instance.constructor.comments.create;
               model = {
                  id: instance.myId,
                  username: user.username,
                  content: content,
                  commentableId: instance.myId,
                  commentableType: instance.constructor.modelName.toLowerCase()
               };
            }

            Create(model)
            .$promise
            .then( function(res, err) {
               instance.comments.push(res);
            });
         };

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
