
var app = angular.module('instanews.article', ['ionic', 'ngResource']);


app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Subarticle',
      function($scope, $stateParams, Article, Subarticle) {

   $scope.subarticles = [];

   function getSubarticles() {
      Article.prototype$__get__subarticles({id: $stateParams.id})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
         console.log(res);
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


   $scope.upvote = function(subarticle, $index) {
      Subarticle.prototype$upvote({id: subarticle.subarticleId}, function (res) {
         for(i = 0; i < $scope.subarticles.length; i++) {
            if($scope.subarticles[i].subarticleId === subarticle.subarticleId) {
               $scope.subarticles[i]._votes = res.subarticle._votes;
               return;
            }
         }
      });
   }

   $scope.downvote = function(subarticle, $index) {
      Subarticle.prototype$downvote({id: subarticle.subarticleId}, function (res) {
         for(i = 0; i < $scope.subarticles.length; i++) {
            if($scope.subarticles[i].subarticleId === subarticle.subarticleId) {
               $scope.subarticles[i]._votes = res.subarticle._votes;
               return;
            }
         }
      });
   }

   $scope.toggleComments = function(subarticle) {
      console.log(subarticle);
      Subarticle.prototype$__get__comments({id: subarticle.subarticleId})
      .$promise
      .then( function (res) {
         for(i = 0; i < $scope.subarticles.length; i++) {
            if($scope.subarticles[i].subarticleId === subarticle.subarticleId) {
               $scope.subarticles[i].comments = [];
               $scope.subarticles[i].comments = res;
               $scope.subarticles[i].showComments = !$scope.subarticles[i].showComments;
               return;
            }
         }
      });
   }
}]);

