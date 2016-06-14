
'use strict';

var app = angular.module('instanews.service.fileTransfer', ['ionic', 'ngResource']);

app.factory('FileTransfer', [
  '$cordovaFileTransfer',
  'Dialog',
  'Platform',
  'rfc4122',
  function(
    $cordovaFileTransfer,
    Dialog,
    Platform,
    rfc4122
  ) {

  var upload = function(server, filePath, options, trustAllHosts) {
    return $cordovaFileTransfer.upload(server, filePath, options, trustAllHosts);
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
              var newName = rfc4122.v4() + '.' + baseType;

              window.resolveLocalFileSystemURL(Platform.getDataDir(), function(filesystem2) {
                fileEntry.copyTo(filesystem2, newName, function(entry) {
                  entry.lastModified = fileObj.lastModified;
                  entry.file(function(file) {
                    entry.size = file.size;
                    cb(entry);
                  });
                }, function(err) {
                  console.log(err);
                  console.log('Error: Failed to move the file');
                  Dialog.alert('Failed to upload the file.', 'Please try again');
                });
              });
            } else {
              var e = new Error('Cannot upload content type ' + baseType);
              console.log(e);
              Dialog.alert('Invalid filetype: ' + baseType , 'Please try again');
            }
          });
        });
      };

      function createFile(path, fileName, cb) {
        window.requestFileSystem( window.PERSISTENT, 100*1024*1024, function() {
          window.resolveLocalFileSystemURL(path, function(dirEntry) {
            dirEntry.getFile(fileName, { create: true, exclusive: false }, function(fileEntry) {
              console.log('successfully created file');
              return cb(fileEntry);
            }, function(err) {
              console.log('error creating file, err: ' + err);
              return cb(null);
            });
          },
          function(err) {
            console.log('error finding specified path, err: ' + err);
            return cb(null);
          });
        },
        function(err) {
          console.log('error accessing file system, err: ' + err);
          Platform.message('Storage space is unavailable!');
          return cb(null);
        });
      } 

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
    createFile: createFile,
    upload: upload,
    download: download
  };
}]);
