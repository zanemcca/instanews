
'use strict';
var app = angular.module('instanews.controller.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', [
      '$scope',
      'Article',
      'Maps',
      'Position',
      'Articles',
      'Navigate',
      function($scope,
         Article,
         Maps,
         Position,
         Articles,
         Navigate) {

   $scope.articles = Articles.get();
   $scope.toggleMenu = Navigate.toggleMenu;
   $scope.scrollTop = Navigate.scrollTop;

   $scope.itemsAvailable = Articles.areItemsAvailable;

   // Localize the map on the users position
   $scope.localize = function() {
      var map = Maps.getFeedMap();
      if( map) {
         Maps.localize(map);
      }
      else {
         console.log('Map not valid! Cannot localize!');
      }
   };

   //TODO Only keep a subset of the articles and load them one at a time from articles
   //we need this so that all of the articles do not render at the same time

   //Update our local articles
   var updateArticles = function() {
      $scope.articles = Articles.get();
      //$scope.itemsAvailable = Articles.areItemsAvailable();
   };

   // Refresh the articles completely
   $scope.onRefresh = function () {
      console.log('Refresh');

      //Reset all necessary values
      Articles.deleteAll();

      //Load the initial articles
      Articles.load( function() {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   // This is called when the bottom of the feed is reached
   $scope.loadMore = function() {
      console.log('Loading more');
      Articles.load( function() {
         $scope.$broadcast('scroll.infiniteScrollComplete');
      });
   };

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.afterEnter', function() {
      var map = Maps.getFeedMap();
      if(map) {
         google.maps.event.trigger(map, 'resize');
      }
   });

   //Update the map if the articles are updated
   Articles.registerObserver(updateArticles);
}]);
