
var app = angular.module('instanews.article', ['ionic', 'ngResource']);


app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Subarticle',
      'Comment',
      'Common',
      function($scope, $stateParams, Article, Subarticle, Comment, Common) {

   $scope.subarticles = [];

   function getSubarticles() {
      Article.subarticles({id: $stateParams.id})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
      });
   }

   getSubarticles();

   $scope.getSubarticleHeight = function(subarticle) {
      var height;
      if (subarticle._file) {
         //Video and image size
         if (subarticle._file.type === 'video') {
            height = 360;
            //console.log('Video: '+ height);
         }
         else if (subarticle._file.type === 'image') {
            height = 480;
            //console.log('Image: '+ height);
         }
      }
      else {
         //Size of text
         height = 50;
         //console.log('Text: '+ height);
      }
      return height;
   }

   $scope.createComment = function( subarticle, content) {
      Common.createComment(Subarticle, subarticle,'subarticle', content);
   }

   $scope.upvoteComment = function(comment) {
      Common.upvote(Comment, comment);
   }

   $scope.downvoteComment = function(comment) {
      Common.downvote(Comment, comment);
   }

   $scope.upvote = function(subarticle) {
      Common.upvote(Subarticle,subarticle);
   }

   $scope.downvote = function(subarticle) {
      Common.downvote(Subarticle,subarticle);
   }

   $scope.toggleComments = function(subarticle) {
      Common.toggleComments(Subarticle,subarticle);
   }
}]);

