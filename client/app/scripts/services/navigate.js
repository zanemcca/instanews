
'use strict';
var app = angular.module('instanews.navigate', ['ionic', 'ngResource','ngCordova']);

app.service('Navigate', [
      '$ionicSideMenuDelegate',
      '$ionicScrollDelegate',
      '$ionicHistory',
      function(
         $ionicSideMenuDelegate,
         $ionicScrollDelegate,
         $ionicHistory){

   var toggleMenu = function() {
      /*
      console.log('Toggling menu');

      if( $ionicSideMenuDelegate.isOpenLeft()) {
         console.log('Open already');
      }
      else {
         console.log('Not Opened');
      }

      */
      $ionicSideMenuDelegate.toggleLeft();
   };

   var disableNextBack = function() {
      $ionicHistory.nextViewOptions({
         disableBack: true
      });
   };

   var scrollTop = function() {
      $ionicScrollDelegate.scrollTop(true);
   };

   var onScroll = function() {
      if($ionicScrollDelegate.getScrollPosition().top > 0) {
         return true;
      }
      else {
         return false;
      }
   };

   /*
  //TODO Rewrite this use ionic on-swipe-down gesture
   $scope.scroll = {
      buttonOn: false
   };

   //TODO get the scroll to top button disabling appropriately
   $scope.onScroll = function() {
      $scope.scroll.buttonOn = Navigate.onScroll();
      console.log('Scroll top on ? ' + $scope.scroll.buttonOn);
   };
  */

   return {
      toggleMenu: toggleMenu,
      scrollTop: scrollTop,
      onScroll: onScroll,
      disableNextBack: disableNextBack
   };
}]);
