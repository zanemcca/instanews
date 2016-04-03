
'use strict';

var app = angular.module('instanews.service.camera', ['ionic', 'ngResource', 'uuid']);

app.factory('Camera', [
    'rfc4122',
    '$cordovaCapture',
    'Platform',
    'FileTransfer',
    '$q',
    function(
      rfc4122,
      $cordovaCapture,
      Platform,
      FileTransfer,
      $q
      ) {

        var copyFile = FileTransfer.copy;

      var captureVideo = function() {
        var q = $q.defer();

        if (!$cordovaCapture) {
          q.resolve(null);
          return q.promise;
        }

        var options = {
          limit: 1 
        };


        Platform.permissions.storage.requestAuthorization( function (succ) {
          if(succ) {
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

                var processEntry = function(entry) {
                  entry.file(function(file) {
                    entry.size = file.size;
                    afterCopy(entry);
                  });
                };

                //Copy all of the videos into the app directory and create a thumbnail for each
                for(var  i = 0; i < videoData.length; i++) {
                  if(Platform.isAndroid()) {
                    //Android video is compressed later so copying would be redundunt.
                    //Also android videos are too large to copy sometimes
                    FileTransfer.resolve(videoData[i].fullPath, processEntry);
                  } else {
                    copyFile(videoData[i].fullPath, afterCopy);
                  }
                }
              },
              function (err) {
                q.reject(err);
              }, options);
          } else {
            q.reject();
          }
        }, function (err) {
          q.reject(err);
        });

        return q.promise;
      };

      var getType = function (name) {
        var type = name.slice(name.lastIndexOf('.') + 1);
        type = type.toLowerCase();

        var map = {
          mov: 'video/quicktime',
          mp4: 'video/mp4',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png'
        };

        if(map.hasOwnProperty(type)) {
          return map[type];
        } else {
          if(name.indexOf('video') > -1) {
              return 'video';
          } else if (name.indexOf('image') > -1) {
              return 'image';
          }
        }
      };

      var getPicture = function (options) {
        /*jshint undef: false */
        var q = $q.defer();

        if (Platform.isCameraPresent()) {
          Platform.permissions.storage.requestAuthorization( function (succ) {
            if(succ) {
              navigator.camera.getPicture(function(uri) {
                var copy = copyFile;
                if(Platform.isAndroid() && uri.indexOf('video') > -1) {
                  //Android videos tend to be larger and they are compressed later 
                  // therefore copying would be redundent.
                  copy = FileTransfer.resolve;
                }

                copy(uri, function(fileEntry) {
                  fileEntry.type = getType(fileEntry.name);
                  q.resolve(fileEntry);
                }, function (err) {
                  q.reject(err);
                });
              }, function(err) {
                q.reject(err);
              }, options);
            } else {
              q.reject();
            }
          }, function(err) {
            q.reject(err);
          });

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
          saveToPhotoAlbum: true,
          targetWidth: 1920,
          targetHeight: 1920,
          sourceType : Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          correctOrientation: true
        };

        return getPicture(options);
      };

      var openMediaGallery = function() {
        /*jshint undef: false */
        var options = {
          targetWidth: 1920,
          targetHeight: 1920,
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
          mediaType: Camera.MediaType.ALLMEDIA,
          //correctOrientation: true
        };

        return getPicture(options);
      };

      return {
        capturePicture: capturePicture,
          openMediaGallery: openMediaGallery,
          captureVideo: captureVideo
      };
    }
]);
