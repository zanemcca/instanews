
angular
.module('starter')
.controller('ArticleCtrl', ['$scope', '$stateParams', 'Article','Subarticle', function($scope, $stateParams, Article, Subarticle) {
   $scope.subarticles = [];

   function getSubarticles() {
      Article.prototype$__get__subarticles({id: $stateParams.id})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
      });
   }

   getSubarticles();

   $scope.upvote = function(subarticle) {
      Subarticle.prototype$upvote({id: subarticle.subarticleId});
   }

   $scope.downvote = function(subarticle) {
      Subarticle.prototype$downvote({id: subarticle.subarticleId});
   }
}]);
