
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
    '_',
    'FileTransfer',
    'ENV',
    function (
      $scope,
      _,
      FileTransfer,
      ENV
    ) {

      if($scope.upload.subarticle._file) {
        var getServer = function() {
          var urlBase = ENV.apiEndpoint;
          return urlBase + '/storages/' + $scope.upload.container + '/upload/';
        };

        var loaded = 0;
        var updateProgress = _.debounce(function () {
          $scope.upload.progress.loaded = loaded;
        }, 16);

        FileTransfer.upload(getServer(), $scope.upload.uri, $scope.upload.options)
        .then(function () {
          $scope.upload.complete.resolve();
        }, function (err) {
          $scope.upload.complete.reject(err);
          console.log(err);
        }, function (progress) {
          loaded = progress.loaded/progress.total * 100;
          updateProgress();
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
        link: function ($scope) {
          if($scope.upload.noFile) {
            $scope.upload.complete.resolve();
          } else {
            $scope.upload.progress = {
              loaded: 0
            };
          }
        },
        templateUrl: 'templates/directives/upload.html'
      };
    }]
);
