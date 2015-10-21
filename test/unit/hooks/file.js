
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
      var instance, next, Next, ne, unset;

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

        unset = function (name) {};

        instance = {
          type: 'video/mp4',
          name: 'video.mp4',
          container: 'videos.container',
          unsetAttribute: function (name) {
            unset(name);
          }
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
            posters: ['c'],
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
            expect(instance.jobId).to.equal(res.id);
            done();
          };

          run();
        });

        it('should call instance.unsetAttributes on "name", "source" and "container"', function(done) {
          var callees = ['name', 'source', 'container'];
          var called = [];
          unset = function(name) {
            expect(callees.indexOf(name)).to.be.above(-1);
            expect(called.indexOf(name)).to.equal(-1);
            called.push(name);
            if(called.length === callees.length) {
              done();
            }
          };

          run();
        });

        it('should call instance.unsetAttributes on "source" and "container"', function(done) {
          var callees = ['source', 'container'];
          var called = [];
          unset = function(name) {
            expect(callees.indexOf(name)).to.be.above(-1);
            expect(called.indexOf(name)).to.equal(-1);
            called.push(name);
            if(called.length === callees.length) {
              done();
            }
          };
          res = null;

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
