
'use strict';

var app = angular.module('instanews.service.fileTransfer', ['ionic', 'ngResource']);

app.factory('FileTransfer', [
  '$cordovaFileTransfer',
  'Platform',
  'rfc4122',
  function(
    $cordovaFileTransfer,
    Platform,
    rfc4122
  ) {

  var upload = function(server, filePath, options) {
    return $cordovaFileTransfer.upload(server, filePath, options);
  };

  var download = function(server, filePath, options) {
    return $cordovaFileTransfer.download(server, filePath, options);
  };

      //Copy the file into the app directory and rename the file with a UUID
      var copy = function (fileURI, cb) {
        resolve(fileURI, function(fileEntry) {
          fileEntry.file(function(fileObj) {
            var whitelist = ['mov', 'mp4', 'jpg', 'jpeg', 'png'];
            //var videos = ['mov', 'mp4'];
            var baseType = '';
            if(fileObj.type) {
              baseType = fileObj.type.slice(fileObj.type.lastIndexOf('/') + 1);
              if(baseType === 'jpeg'){
                baseType = 'jpg';
              }
            } else {
              baseType  = fileObj.name.slice(fileObj.name.lastIndexOf('.') + 1);
            }

            if(whitelist.indexOf(baseType.toLowerCase()) > -1) {
              var message;
              //TODO Move this into the upload service where it belongs
              /*
              if(videos.indexOf(baseType.toLowerCase()) > -1) {
                if(fileObj.size > 250*1024*1024) {
                  //100Mb video size limit
                  message = 'Sorry but videos must be less than 250Mb';
                }
              } else if(fileObj.size > 5*1024*1024) {
                //5Mb photo size limit
                message = 'Sorry but photos must be less than 5Mb';
              }
             */

              if(message) {
                Platform.showToast(message);
                return;
              }

              var newName = rfc4122.v4() + '.' + baseType;

              window.resolveLocalFileSystemURL(Platform.getDataDir(), function(filesystem2) {
                //TODO Must use copyTo if the original is from the gallery
                fileEntry.copyTo(filesystem2, newName, function(entry) {
                  entry.lastModified = fileObj.lastModified;
                  cb(entry);
                }, function(err) {
                  console.log(err);
                  console.log('Error: Failed to move the file');
                });
              });
            } else {
              var e = new Error('Cannot upload content type ' + baseType);
              console.log(e);
            }
          });
        });
      };

      var resolve = function (fileURI, cb) {
        if(fileURI.indexOf('content://') === 0) {
          if(fileURI.indexOf('video') === -1 && fileURI.indexOf('image') === -1) {
            var message = 'Sorry but you can only upload videos and photos!';
            Platform.showToast(message);
            return;
          }
        } else if(fileURI.indexOf('file:/') !== 0) {
          fileURI = 'file://' + fileURI;
        }

        //TODO Remove once the Capture.avi issue is resolved
        console.log(fileURI);

        window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
          cb(fileEntry);
        }, function(err) {
          console.log('Error: Failed to resolve filesystem URL: '+ fileURI);
          console.log(err);
          cb();
        });
      };

  return {
    resolve: resolve,
    copy: copy,
    upload: upload,
    download: download
  };
}]);
