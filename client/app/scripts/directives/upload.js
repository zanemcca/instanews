
'use strict';
var app = angular.module('instanews.directive.upload', [
  'ionic',
  'ngResource',
]);

// Video controller
app.controller(
  'uploadCtrl', [
    '$scope',
    'FileTransfer',
    'ENV',
    function (
      $scope,
      FileTransfer,
      ENV
    ) {
      if($scope.upload.noFile) {
        $scope.upload.complete.resolve();
      } else {
        $scope.upload.progress = {};

        var getServer = function() {
          var urlBase = ENV.apiEndpoint;
          return urlBase + '/storages/' + $scope.upload.container + '/upload/';
        };

        FileTransfer.upload(getServer(), $scope.upload.uri, $scope.upload.options)
        .then(function () {
          $scope.upload.complete.resolve();
          //TODO Change color to green or some shit
        }, function (err) {
          $scope.upload.complete.reject(err);
          console.log(err);
        }, function (progress) {
          $scope.upload.progress = progress;
          console.log('Progress: ' + JSON.stringify(progress));
        });
      }
    }]
);

//TODO On destroy we need to delete thumbnail file for videos
//TODO On complete we need to delete local files

//This directive will display subarticle upload in a consumable format
app.directive(
  'inupload', [
    function () {

      return {
        restrict: 'E',
        scope: {
          upload: '='
        },
        templateUrl: 'templates/directives/upload.html'
      };
    }]
);
