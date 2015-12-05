
'use strict';
var app = angular.module('instanews.directive.upload', [
  'ionic',
  'ngResource',
  'ngMaterial'
]);

// Video controller
/*
app.controller(
  'uploadCtrl', [
    '$scope',
    '_',
    'FileTransfer',
    'ENV',
    function (
      $scope,
      _,
      FileTransfer,
      ENV
    ) {
    }]
);
*/


//TODO On complete we need to delete local files

//This directive will display subarticle upload in a consumable format
// istanbul ignore next
app.directive(
  'inupload', [
    function () {

      return {
        restrict: 'E',
        scope: {
          upload: '='
        },
        link: function ($scope) {
          $scope.upload.resolve();
        },
        templateUrl: 'templates/directives/upload.html'
      };
    }]
);
