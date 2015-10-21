
'use strict';

var app = angular.module('instanews.service.upload', ['ionic', 'ngResource']);

app.factory('Upload', [
  '$q',
  'User',
  function(
    $q,
    User
  ) {

    //Create a video subarticle for the given parentId
    var uploadVideo = function(video) {
      console.log(video);

      var subarticle = {
        _file: {
          name: video.name,
          sources: [video.nativeURL],
          container: 'instanews-videos-in',
          size: video.size,
          type: video.type
        }
      };

      var upload = {
        container: 'instanews-videos-in',
        uri: video.nativeURL,
        options: {
          fileName: video.name,
          mimeType: video.type,
          headers: { 'Authorization': User.getToken()}
        },
        subarticle: subarticle
      };

      upload.complete = $q.defer();

      return upload;
    };

    var uploadPicture = function(picture) {
      console.log(picture);

      var subarticle = {
        _file: {
          name: picture.name,
          source: picture.nativeURL,
          container: 'instanews-photos',
          size: picture.size,
          caption: picture.caption,
          type: picture.type
        }
      };

      var upload = {
        container: 'instanews-photos',
        uri: picture.nativeURL,
        options: {
          fileName: picture.name,
          mimeType: picture.type,
          headers: { 'Authorization': User.getToken()}
        },
        subarticle: subarticle
      };

      upload.complete = $q.defer();

      return upload;
    };

    var uploadText = function(text) {
      var subarticle = {
        text: text
      };

      var upload = {
        subarticle: subarticle,
        complete: $q.defer()
      };

      upload.complete.resolve();

      return upload;
    };

    var destroy = function () {
      //TODO Cancel uploads and delete already completed ones
    };

    return {
      video: uploadVideo,
      picture: uploadPicture,
      text: uploadText,
      destroy: destroy
    };
  }]);
