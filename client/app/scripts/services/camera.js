
'use strict';

var app = angular.module('instanews.service.camera', ['ionic', 'ngResource', 'uuid']);

app.factory('Camera', [
    'rfc4122',
    '$cordovaCapture',
    'Platform',
    '$q',
    function(
      rfc4122,
      $cordovaCapture,
      Platform,
      $q
      ) {

      /*
         var options = {
         correctOrientation: true
         };
         */

      //Copy the file into the app directory and rename the file with a UUID
      var copyFile = function(fileURI, cb, error) {
        if(fileURI.indexOf('file://') !== 0) {
          fileURI = 'file://' + fileURI;
      }

      window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
        console.log(fileEntry);
        fileEntry.file(function(fileObj) {
          console.log(fileObj);
          var whitelist = ['mov', 'qt', 'mp4', 'mkv', 'avi', 'jpg', 'jpeg', 'png'];
          var baseType  = fileObj.name.slice(fileObj.name.lastIndexOf('.') + 1);

          if(whitelist.indexOf(baseType.toLowerCase()) > -1) {
            var newName = rfc4122.v4() + '.' + baseType;

            window.resolveLocalFileSystemURL(Platform.getDataDir(), function(filesystem2) {
              fileEntry.copyTo(filesystem2, newName, function(entry) {
                entry.size = fileObj.size;
                entry.lastModified = fileObj.lastModified;
                console.log(entry);
                cb(entry);
              }, function(err) {
                console.log('Error: Failed to move the file: ' + err);
                error(err);
              });
            });
          } else {
            var e = new Error('Cannot upload content type ' + fileObj.type);
            console.log(e);
            error(e);
          }
        });
      }, function(err) {
        console.log('Error: Failed to resolve filesystem URL');
        console.log(err);
        error(err);
      });
      };

      var captureVideo = function() {
        var q = $q.defer();

        if (!$cordovaCapture) {
          q.resolve(null);
          return q.promise;
        }

        var options = {
          limit: 1 
        };

        $cordovaCapture.captureVideo(options)
          .then(function (videoData) {

            var finished = 0;
            var files = [];

            var afterCopy = function(fileEntry) {

              console.log('After copy of video');
              console.log(fileEntry);

              fileEntry.type = videoData[0].type;

              files.push(fileEntry);
              finished++;
              if(finished === videoData.length) { 
                if(files.length) {
                  if(files.length > 1) {
                    console.log('More than one video was grabbed');
                  }
                  q.resolve(files[0]);
                } else {
                  q.resolve();
                }
              }
            };

            //Copy all of the videos into the app directory and create a thumbnail for each
            for(var  i = 0; i < videoData.length; i++) {
              copyFile(videoData[i].fullPath, afterCopy);
            }
          }, function (err) {
            q.reject(err);
          }, options);

        return q.promise;
      };

      var getPicture = function (options) {
        /*jshint undef: false */
        var q = $q.defer();

        if (Platform.isCameraPresent()) {
          navigator.camera.getPicture(function(uri) {
            copyFile(uri, function(fileEntry) {
              //TODO It could be a video
              fileEntry.type = 'image/jpeg';
              if(options.encodingType === Camera.EncodingType.PNG) {
                fileEntry.type = 'image/png';
              }

              q.resolve(fileEntry);
            }, function (err) {
              q.reject(err);
            });
          }, function(err) {
            q.reject(err);
          }, options);

          return q.promise;
        } else {
          var e = new Error('No Camera available!');
          q.reject(e);
          return q.promise;
        }
      };

      var capturePicture = function() {
        /*jshint undef: false */
        var options = {
          savePhotoToAlbum: true,
          allowEdit: true,
          sourceType : Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          correctOrientation: true
        };

        return getPicture(options);
      };

      var openMediaGallery = function() {
        /*jshint undef: false */
        var options = {
          allowEdit: true,
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
          mediaType: Camera.MediaType.ALLMEDIA,
          correctOrientation: true
        };

        return getPicture(options);
      };

      return {
        capturePicture: capturePicture,
          openMediaGallery: openMediaGallery,
          captureVideo: captureVideo
      };
    }]);
