'use strict';

var app = angular.module('instanews.directive.scrollTop', ['ionic', 'ngResource']);

app.directive('inScrollTop', [
  'Navigate',
  '$ionicGesture',
  '$timeout',
  'Platform',
  function (
    Navigate,
    $ionicGesture,
    $timeout,
    Platform
  ) {
    return {
      restrict: 'E',
      scope: {
        scrollHandle: '@',
        preScroll: '='
      },
      controller: function(
        $scope,
        _
      ) {
        $scope.swipeDownObj = {};

        $scope.scroll = Navigate.scroll({
          scrollHandle: $scope.scrollHandle,
          $timeout: $timeout,
        });
        $scope.scroll.showScrollToTop = false;

        $scope.scrollToTop = function () {
          if($scope.preScroll) {
            $scope.preScroll($scope.scroll.scrollTop);
          } else {
            $scope.scroll.scrollTop();
          }
        };

        $scope.$on('$ionicView.unloaded', function () {
          $ionicGesture.off(swipeGesture, 'swipedown', onSwipeDown);
        });

        $scope.showScrollToTop = function () {
          return $scope.scroll.showScrollToTop;
        };

        if(!Platform.isBrowser()) {
          var onSwipeDown = _.debounce(function () {
            if(!$scope.scroll.showScrollToTop) {
              //Only display scroll to top if we are scrolled down far enough
              if($scope.scroll.getPosition().top > 2000) {
                $scope.$apply(function () {
                  $scope.scroll.showScrollToTop = true;
                  $timeout(function() {
                    $scope.scroll.showScrollToTop = false;
                  }, 2000);
                });
              }
            }
          }, 3000, true);

          var element = angular.element(document.getElementById($scope.scrollHandle));
          var swipeGesture = $ionicGesture.on('swipedown', onSwipeDown, element, $scope.swipeDownObj);
        }
      },
      templateUrl: 'templates/directives/scrollTop.html'
    };
  }
]);
