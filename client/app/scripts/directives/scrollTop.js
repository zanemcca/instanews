'use strict';

var app = angular.module('instanews.directive.scrollTop', ['ionic', 'ngResource']);

app.directive('inScrollTop', [
  'Navigate',
  '$ionicGesture',
  '$timeout',
  function (
    Navigate,
    $ionicGesture,
    $timeout
  ) {
    return {
      restrict: 'E',
      scope: {
        scrollHandle: '@'
      },
      controller: function(
        $scope
      ) {
        $scope.swipeDownObj = {};

        $scope.scroll = Navigate.scroll({
          scrollHandle: $scope.scrollHandle,
          $timeout: $timeout,
        });
        $scope.scroll.showScrollToTop = false;

        $scope.$on('$ionicView.unloaded', function () {
          $ionicGesture.off($scope.swipeDownObj, 'swipedown', function (err) {
            if(err) {
              console.log('Error: Failed to clear gesture!');
              console.log(err.stack);
            }
          });
        });

        $scope.showScrollToTop = function () {
          return $scope.scroll.showScrollToTop;
        };

        var onSwipeDown = function () {
          if(!$scope.scroll.showScrollToTop) {
            console.log('Setting showScrollToTop');
            $scope.$apply(function () {
              $scope.scroll.showScrollToTop = true;
              $timeout(function() {
                console.log('Clearing showScrollToTop');
                $scope.scroll.showScrollToTop = false;
              }, 2000);
            });
          }
        };

        var element = angular.element(document.getElementById($scope.scrollHandle));
        $ionicGesture.on('swipedown', onSwipeDown, element, $scope.swipeDownObj);
      },
      templateUrl: 'templates/directives/scrollTop.html'
    };
  }
]);
