
'use strict';

var app = angular.module('instanews.service.fileTransfer', ['ionic', 'ngResource']);

app.factory('FileTransfer', [
  '$cordovaFileTransfer',
  function(
    $cordovaFileTransfer
  ) {

  var upload = function(server, filePath, options) {
    return $cordovaFileTransfer.upload(server, filePath, options);
  };

  var download = function(server, filePath, options) {
    return $cordovaFileTransfer.download(server, filePath, options);
  };

  return {
    upload: upload,
    download: download
  };
}]);
