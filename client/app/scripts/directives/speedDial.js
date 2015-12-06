
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
        var text = {
          partial: ''
        };

        $scope.getText = function () {
          return $scope.uploads.getText(text);
        };
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
