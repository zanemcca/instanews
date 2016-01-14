"use strict";

describe('instanews.service.camera', function() {

  var Camera,
    rfc4122,
    $q,
    $window,
    copyToResult,
    Platform,
    FileTransfer,
    fileEntry,
    fileObj,
    $cordovaCapture;

  beforeEach(function() {
    module('instanews.service.camera');

    module(function($provide) {

      $provide.service('Platform', function() {
        return {
          getDataDir: function() {
            return 'file://a/fake/uri/';
          },
          isAndroid: function () {
            return true;
          }
        };
      });

      $provide.service('FileTransfer', function() {
        return {
          copy: function(fileURI, cb) {
          },
          resolve: function(fileURI, cb) {
          }
        };
      });

      $provide.service('$cordovaCapture', function() {
        return {
          captureVideo: function(options) {
            return {
              then: function(cb) {
                cb([{
                  fullPath: 'file://uri/to/file.mp4'
                }]);
              }
            };
          }
        };
      });
    });
  });

  beforeEach(inject(function(
    _$cordovaCapture_,
    _Platform_,
    _FileTransfer_,
    _$window_,
    _rfc4122_,
    _Camera_,
    _$q_
  ) {
    $cordovaCapture = _$cordovaCapture_;
    $window = _$window_;
    Platform = _Platform_;
    FileTransfer = _FileTransfer_;
    Camera = _Camera_;
    rfc4122 = _rfc4122_;
    $q = _$q_;

    //DEFINE GLOBAL OBJECTS 
    fileObj = {
      name: 'vid.mp4',
      size: 1,
      lastModified: new Date(),
      type: 'video/mp4'
    };

    copyToResult = {
      nativeURL: '/a/fake/url/vid.mp4'
    };

    fileEntry = {
     file: function(succ,err) {
      succ(fileObj);
     },
     moveTo: function(fs, name, succ, err) {
       succ(copyToResult);
     }
    };

    //window stub ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $window.resolveLocalFileSystemURL = function(URI, succ, err) {
      succ(fileEntry);
    };

    $window.PKVideoThumbnail = {
      createThumbnail: function(videoURL, destURL, succ, err) {
        succ(destURL);
      }
    };
  }));

  describe('captureVideo', function() {
    it('should call $q.defer',function() {
      sinon.spy($q, 'defer');
      Camera.captureVideo();

      expect($q.defer.calledOnce).to.be.true;
    });
  });

  describe.skip('copyFile', function() {
    //TODO Move this into fileTransfer
    it('should call window.resolveLocalFileSystemURL twice',function() {
      sinon.spy($window, 'resolveLocalFileSystemURL');
      Camera.captureVideo();
      expect($window.resolveLocalFileSystemURL.calledTwice).to.be.true;
    });
  });
});
