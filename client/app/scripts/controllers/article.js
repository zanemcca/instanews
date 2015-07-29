'use strict';

var app = angular.module('instanews.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
  '$scope',
  '$stateParams',
  'Article',
  'Articles',
  'Subarticles',
  'Maps',
  function(
    $scope,
    $stateParams,
    Article,
    Articles,
    Subarticles,
    Maps
  ) {

   //Scope variables
   $scope.article = Articles.getOne($stateParams.id);
   $scope.areItemsAvailable = Subarticles.areItemsAvailable;

   var marker;

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.afterEnter', function() {
      var map = Maps.getArticleMap();
      if(map) {
         marker = Maps.setMarker(map,$scope.article.location);
      }
   });

   $scope.$on('$ionicView.afterLeave', function() {
      marker = Maps.deleteMarker(marker);
      Subarticles.deleteAll();
      Subarticles.unregisterObserver(updateSubarticles);
   });

  $scope.onRefresh = function () {
    console.log('Refresh');
    Subarticles.deleteAll($stateParams.id);
    Subarticles.load($stateParams.id, function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMore = function() {
    Subarticles.load($stateParams.id, function() {
      console.log('Loading more');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

   var updateSubarticles = function() {
     $scope.subarticles = Subarticles.get($stateParams.id);
   };

   Subarticles.registerObserver(updateSubarticles);
}]);

