"use strict";

describe('instanews.service.fileTransfer', function() {

  var fileTransfer,
  rfc4122,
  cordovaFileTransfer;

  beforeEach(function() {

    module('instanews.service.fileTransfer');
    module('mock.services.dialog');

    module(function($provide) {
      $provide.service('$cordovaFileTransfer', function() {
        return {
          upload: function() {},
          download: function() {}
        };
      });

      $provide.service('rfc4122', function() {
        return {
        };
      });

      $provide.service('Platform', function() {
        return {
          isAndroid: function() {
            return true;
          }
        };
      });
    });
  });

  beforeEach(inject(function(
    $cordovaFileTransfer,
    _rfc4122_,
    FileTransfer
  ) {
    rfc4122 = _rfc4122_;
    cordovaFileTransfer = $cordovaFileTransfer;
    fileTransfer = FileTransfer;
  }));

  describe('upload', function() {
    it('should call $cordovaFileTransfer.upload once', function() {
      sinon.spy(cordovaFileTransfer, 'upload');
      fileTransfer.upload();
      expect(cordovaFileTransfer.upload.calledOnce).to.be.true;
    });
  });

  describe('download', function() {
    it('should call $cordovaFileTransfer.download once', function() {
      sinon.spy(cordovaFileTransfer, 'download');
      fileTransfer.download();
      expect(cordovaFileTransfer.download.calledOnce).to.be.true;
    });
  });
});
