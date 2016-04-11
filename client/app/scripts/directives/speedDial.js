
// jshint camelcase: false
'use strict';
var app = angular.module('instanews.directive.speedDial', ['ionic']);

app.directive('inSpeedDial', [
  function (
  ) {
    return {
      restrict: 'E',
      scope: {
        position: '=',
        uploads: '='
      },
      controller: function(
        $scope
      ){ 
        $scope.fab = {
          isOpen: false
        };

        var text = {
          partial: ''
        };

        $scope.getText = function () {
          return $scope.uploads.getText(text);
        };

        // Workaround for issue #7981 on angular material
        // aka - Fixes our 'spacebar' issue #293
        var keyboardListener = function() {
          $scope.fab.isOpen = false;
          $scope.$digest();
        };

        window.addEventListener('native.keyboardshow', keyboardListener);
        $scope.$on('$destroy', function() {
          window.removeEventListener('native.keyboardshow', keyboardListener);
        });
      },
      link: function($scope) {
        if(!$scope.position) {
          $scope.position = 'bottom-right';
        }
      },
      templateUrl: 'templates/directives/speedDial.html'
    };
  }
]);
