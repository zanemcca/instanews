'use strict';

var app = angular.module('instanews.directive.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
      'User',
      'Comment',
      'Subarticle',
      'Article',
      function (
        User,
        Comment,
        Subarticle,
        Article
      ) {

   return {
      restrict: 'E',
      scope: {
         owner: '='
      },
      controller: function($scope) {

        var Models = {
          article: Article,
          comment: Comment,
          subarticle: Subarticle
        };

         $scope.createComment = function (instance, content) {
            var user = User.get();

            Comment.create({
               username: user.username,
               content: content,
               commentableId: instance.id,
               commentableType: instance.modelName
            }).$promise
            .then(function(res,err) {
               if(err) {
                  console.log(err);
               }
               else {
                  instance.comments.push(res);
               }
            });
         };

         $scope.loadMore = function(instance) {
            var order = 'rating DESC';
            if ( instance.commentableId ) {
               order = 'date DESC';
            }

            if(Models.hasOwnProperty(instance.modelName)) {
              Models[instance.modelName].comments({
                 id: instance.id,
                 filter: {
                   /*
                    where: {
                       commentableType: instance.modelName,
                       commentableId: instance.id
                    },
                   */
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
            }
            else {
              console.log('Warning: Unknown commentableType!');
            }
         };
      },
      templateUrl: 'templates/directives/comments.html'
   };
}]);
