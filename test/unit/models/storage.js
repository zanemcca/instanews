
/*jshint expr: true*/

var expect = require('chai').expect;
var common =  require('../../common');
var sinon = require('sinon');

var Storage = {
  disableRemoteMethod: function () {}
};

function start() {
  Storage = {
    remoteMethod: function (name, options) {},
    disableRemoteMethod: function () {}
  };

  return common.req('models/storage')(Storage);
}

exports.run = function () {
  describe('Storage', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('initialization', function () {
      var aws = require('aws-sdk');
      var cred = common.req('conf/credentials');
      var err, res, credentials;
      var createJob;

      beforeEach(function () {
        credentials = {
          key: 'key',
          keyId: 'keyId'
        };

        createJob = function (params, cb) {
          cb(err, res);
        };

        sandbox.stub(cred, 'get', function (name) {
          return credentials;
        });

        sandbox.stub(aws, 'ElasticTranscoder', function(options) {
          expect(options).to.deep.equal({
            region: 'us-east-1',
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.key
          });

          this.createJob = function(params, cb) {
            createJob(params, cb);
          };

          return this;
        });
      });

      describe('triggerTranscoding', function () {
        var run,
        containerName,
        filename,
        cb;

        beforeEach(function () {
          containerName = 'videos.container';
          filename = 'video.mp4';
          cb = function () {};

          run = function () {
            start();
            Storage.triggerTranscoding(containerName, filename, cb);
          };
        });

        it('should get the transcoder paramaters', function (done) {
          containerName = 'instanews.videos.in';

          createJob = function (params, cb) {
            expect(params).to.exist;
            expect(params.PipelineId).to.exist;
            done();
          };

          run();
        }); 

        describe('createJob', function () {
          //TODO
        });
      });
    });
  });
};
