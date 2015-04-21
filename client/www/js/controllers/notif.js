var app = angular.module('instanews.notif', ['ionic', 'ngResource', 'underscore']);

app.controller('NotificationCtrl', [
      '$scope',
      '$stateParams',
      '$state',
      'Article',
      'Articles',
      'Subarticle',
      'Comment',
      'Notifications',
      'Maps',
      '_',
      function($scope,
         $stateParams,
         $state,
         Article,
         Articles,
         Subarticle,
         Comment,
         Notifications,
         Maps,
         _) {


   var notification = Notifications.getOne($stateParams.id);

   $scope.type = notification.type;
   if( $scope.type === 'subarticle') {
      var filter = {
         include: {
            relation: 'article'
         }
      };

      Subarticle.findById({ id: notification.parentId, filter: filter})
      .$promise
      .then( function(res) {
         $scope.subarticle = res;
         $scope.article = res.article;
      });
   }
   else if( $scope.type === 'comment') {
      var filter = {
         include: {
            relation: 'commentable'
         }
      };

      Comment.findById({id: notification.parentId, filter: filter})
      .$promise
      .then(function(res) {
         handleCommentResult(res);
      });
   }
   else console.log('Unknown notification type!');

   var tempComment = {};

   var handleCommentResult = function(res) {
      if(res.commentableType === 'comment') {
         console.log('Parent of comment was a comment!');

         var tempComment = res;

         Comment.findById({id: res.commentableId, filter: filter})
         .$promise
         .then(function(res) {
            res.showComments = true;
            res.comments = [tempComment];
            handleCommentResult(res);
         });
      }
      else if(res.commentableType === 'subarticle') {
         console.log('Parent of comment was a subarticle!');
         $scope.subarticle = res.commentable;
         $scope.subarticle.showComments = true;
         $scope.subarticle.comments = [res];

         Article.findById({id: $scope.subarticle.parentId})
         .$promise
         .then( function(res) {
            $scope.article = res;
         });
      }
      else if( res.commentableType === 'article') {
         console.log('Parent of comment was an article!');
         $scope.article = res.commentable;
         $scope.article.showComments = true;
         $scope.article.comments = [res];

         Article.subarticles({
            id: $scope.article.id,
            filter: {
               order: 'rating DESC',
               limit: 1
            }
         }).$promise
         .then(function(res) {
            $scope.subarticle = res[0];
         });
      }
   };

}]);

