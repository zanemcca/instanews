
'use strict';

var app = angular.module('instanews.service.fileTransfer', ['ionic', 'ngResource']);

app.factory('FileTransfer', [
      '$cordovaFileTransfer',
      function($cordovaFileTransfer) {

  return {
    upload: $cordovaFileTransfer.upload,
    download: $cordovaFileTransfer.download
  };
}]);
