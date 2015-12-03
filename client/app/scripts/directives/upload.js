
'use strict';
var app = angular.module('instanews.directive.upload', [
  'ionic',
  'ngResource',
  'ngMaterial'
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
      }

      if($scope.upload.subarticle._file) {
        var getServer = function() {
          var urlBase = ENV.apiEndpoint;
          return urlBase + '/storages/' + $scope.upload.container + '/upload/';
        };

        FileTransfer.upload(getServer(), $scope.upload.uri, $scope.upload.options)
        .then(function () {
          $scope.upload.complete.resolve();
        }, function (err) {
          $scope.upload.complete.reject(err);
          console.log(err);
        }, function (progress) {
          $scope.upload.progress = progress;
          console.log('Progress: ' + JSON.stringify(progress));
        });
      } else {
        $scope.upload.complete.resolve();
      }
    }]
);

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
        templateUrl: 'templates/directives/upload.html'
      };
    }]
);
