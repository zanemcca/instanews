
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

   var options = {
      correctOrientation: true
   };

   //Copy the file into the app directory and rename the file with a UUID
   var copyFile = function(fileURI, cb) {
     window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
       fileEntry.file(function(fileObj) {
         var type  = fileObj.name.split('.');
         var newName = rfc4122.v4() + '.' + type[type.length - 1];

         window.resolveLocalFileSystemURL(Platform.getDataDir(), function(filesystem2) {
           fileEntry.copyTo(filesystem2, newName, function(entry) {
             entry.size = fileObj.size;
             entry.lastModified = fileObj.lastModified;
             entry.type = fileObj.type;
             cb(entry);
           }, function(err) {
             console.log('Error: Failed to move the file: ' + err);
           });
         });
       });
     }, function(err) {
       console.log('Error: Failed to resolve filesystem URL: ' + err);
     });
   };

   var captureVideo = function() {
      var q = $q.defer();

      if (!$cordovaCapture) {
         q.resolve(null);
         return q.promise;
      }

      var options = {
        limit: 3
      };

      $cordovaCapture.captureVideo(options)
      .then(function (videoData) {
        
        var finished = 0;
        var files = [];

        var afterCopy = function(fileEntry) {

          fileEntry.thumbnailURI = fileEntry.nativeURL.slice(0, fileEntry.nativeURL.lastIndexOf('.') + 1) + 'jpg';

           window.PKVideoThumbnail.createThumbnail(fileEntry.nativeURL, fileEntry.thumbnailURI, 
           function(uri) {
             console.log('Succesfull thumbnail creation! ' + uri);
             files.push(fileEntry);
             finished++;
             if(finished === videoData.length) { 
               q.resolve(files);
             }
           },
           function(err) {
             console.log('Error: Failed to create thumbnail for video: ' + JSON.stringify(err));
             q.reject(err);
           });
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

   var capturePicture = function() {
      var q = $q.defer();

      if (!navigator.device.capture) {
         q.resolve(null);
         return q.promise;
      }

      navigator.camera.getPicture(function(uri) {
        copyFile(uri, function(fileEntry) {
          q.resolve(fileEntry);
        });

      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    };

    var getPictures = function( cb) {
      window.imagePicker.getPictures( function(res) {

        var finished = 0;
        var files = [];

        var afterCopy = function(entry) {
          files.push(entry);
          finished++;
          if( finished === res.length ) {
            cb(files);
          }
        };

        for( var i = 0; i < res.length; i++) {
          copyFile(res[i], afterCopy);
        }
      }, function(err) {
        console.log('Error: Failed to get pictures from teh gallery!: ' + JSON.stringify(err));
      });
    };

  return {
    getPicture: capturePicture,
    getPictures: getPictures,
    getVideo: captureVideo
  };
}]);
