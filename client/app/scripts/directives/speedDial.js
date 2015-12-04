
// jshint camelcase: false
'use strict';
var app = angular.module('instanews.directive.speedDial', ['ionic']);

app.directive('inSpeedDial', [
  'Post',
  function (
    Post
  ) {
    return {
      restrict: 'E',
      scope: {
        position: '='
      },
      controller: function ($scope) {
        $scope.Post = Post;
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
