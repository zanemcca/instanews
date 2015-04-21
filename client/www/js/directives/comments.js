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
            var user = User.get();

            Comment.create({
               username: user.username,
               content: content,
               commentableId: instance.id,
               commentableType: instance.modelName
            }).$promise
            .then(function(res,err) {
               instance.comments.push(res);
            });
         };

         $scope.loadMore = function(instance) {
            var order = 'rating DESC';
            if ( instance.commentableId ) {
               order = 'date DESC';
            }

            Comment.find({
               filter: {
                  where: {
                     commentableType: instance.modelName,
                     commentableId: instance.id
                  },
                  limit: 10,
                  skip: instance.comments.length,
                  order: order
               }
            }).$promise
            .then( function (comments) {
               //Remove duplicates
               for( var i = 0; i < comments.length; i++) {
                  for( var j = 0; j < instance.comments.length; j++) {
                     var comment = instance.comments[j];
                     if( comment.id === comments[i].id) {
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
