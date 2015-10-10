
/*jshint expr: true*/

var expect = require('chai').expect;
var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var File = app.models.File;

function run() {
  return common.req('hooks/file')(app);
}

exports.run = function () {
  describe.skip('File', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    var observe;
    beforeEach(function() {
      observe = function(hook, cb) {};
      sandbox.stub(File, 'observe', function (hook, cb) {
        return observe(hook, cb);
      });
    });

    describe('observe', function() {
      var hookName;
      var ctx, next, Next, ne;

      beforeEach(function() {
        ctx = {
          query: {
            include: {
              relation: 'something'
            }
          },
          instance: {
            username: 'user',
            parentId: 'someid',
            id: 'id'
          },
          isNewInstance: true
        };

        ne = {
          xt: function(err) {}
        };

        Next = function(err) {};

        next = sandbox.stub(ne, 'xt', function(err) {
          return Next(err);
        });

        observe = function(hook, cb) {
          if(hook === hookName) {
            cb(ctx, next);
          }
        };
      });

      afterEach(function() {
        expect(next.calledTwice).to.be.true;
      });

      describe('before save', function () {
        var aws = require('aws-sdk');
        var cred = common.req('conf/credentials');
        var err, res, credentials;

        beforeEach(function () {
          hookName = 'before save';

          ctx.instance = {
            type: 'video/mp4',
            name: 'video.mp4',
            container: 'videos.container'
          };
        });

        describe('triggerTranscoding', function () {
          var container,
          name,
          cb,
          triggerCb,
          err,
          res;

          beforeEach(function () {
            container = 'videos.container';
            name = 'video.mp4';
            res = 'results';

            triggerCb = function (cntr, name, cb) {
              cb(err, res);
            };

            //TODO Fill in res appropriately
            res = {};

            sandbox.stub(app.models.storage, 'triggerTranscoding', function(cntr, nme, cb) {
              triggerCb(cntr, nme, cb);
            });
          });

          it('should create a .m3u8 source file', function (done) {
            Next = function(err) {
              expect(err).to.not.exist;
              var file = ctx.instance;
              expect(file.sources.length).to.equal(2);
              expect(file.sources[0].indexOf('.m3u8')).to.equal(file.sources[0].length -5);
              done();
            };

            run();
          });

          it('should create a .png thumbnail file', function (done) {
            Next = function(err) {
              expect(err).to.not.exist;
              var file = ctx.instance;
              expect(file.sources.thumbnail.indexOf('.png')).to.equal(file.sources[0].length - 4);
              done();
            };

            run();
          });
        });
      });
    });
  });
};
