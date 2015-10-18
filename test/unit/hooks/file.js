
/*jshint expr: true*/

var expect = require('chai').expect;
var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var File = app.models.File;

function start() {
  return common.req('hooks/file')(app);
}

exports.run = function () {
  describe('File', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('beforeSave', function() {
      var run;
      var instance, next, Next, ne;

      beforeEach(function() {
        run = function () {
          start();
          File.beforeSave(instance, next);
        };

        ne = {
          xt: function(err) {}
        };

        Next = function(err) {};

        next = sandbox.stub(ne, 'xt', function(err) {
          return Next(err);
        });

        instance = {
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

          res = {
            outputs: ['a', 'b'],
            container: 'new.container',
            id: 'id'
          };

          sandbox.stub(app.models.storage, 'triggerTranscoding', function(cntr, nme, cb) {
            triggerCb(cntr, nme, cb);
          });
        });

        it('should save the result', function (done) {
          Next = function(err) {
            expect(err).to.not.exist;
            expect(instance.sources).to.deep.equal(res.outputs);
            expect(instance.container).to.not.exist;
            expect(instance.source).to.not.exist;
            expect(instance.jobId).to.equal(res.id);
            done();
          };

          run();
        });

        it('should propogate the error', function (done) {
          err = 'error';
          Next = function(error) {
            expect(err).to.equal(error);
            done();
          };

          run();
        });
      });
    });
  });
};
