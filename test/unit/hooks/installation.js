
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');

var app = common.req('server');
var loopback = require('loopback');
var Installation = app.models.Installation;

function run() {
  return common.req('hooks/installation')(app);
}

exports.run = function () {
  describe('Installation', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    var ctx, next;
    var Next;

    var loopback = require('loopback');

    beforeEach(function() {
      ctx = {
        Model: {
          modelName: 'installation'
        },
        instance: {
          deviceType: 'android',
          deviceToken: 'someToken',
          userId: 'username'
        },
        isNewInstance: true
      };

      Next = function(err) {};

      var ne = {
        xt: function(err) {
          Next(err);
        }
      };

      next = sandbox.spy(ne, 'xt');
    });

    describe('observe', function() {
      var hookName;

      beforeEach(function() {
        sandbox.stub(Installation, 'observe', function(hook, cb) {
          if(hook === hookName) {
            cb(ctx, next);
          }
        });
      });

      describe('before save', function() {
        beforeEach(function() {
          hookName = 'before save';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        describe('valid instance', function() {
          var upsert, find;

          beforeEach(function() {
            upsert = function (model, cb) {cb();};
            find = function (query, cb) {cb();};

            sandbox.stub(Installation , 'upsert', function (model, cb) {
              upsert(model, cb);
            });

            sandbox.stub(Installation , 'find', function (query, cb) {
              console.log('asdkjbgalkbjfg');
              find(query, cb);
            });

          });

          describe( 'find', function () {
            var result, error;
            beforeEach( function () {
              error = null;
              result = ['ress'];

              find = function (query, cb) {
                cb(error, result);
              };
            });

            it('should propogate errors from Installation.find', function(done) {
              error = 'errrrrr';

              Next = function (err) {
                expect(err).to.equal(error);
                done();
              };

              run();
            });

            it('should return a 403 because there are too many installations for the device', function(done) {
              result.push('second res');

              Next = function (err) {
                expect(err.status).to.equal(403);
                done();
              };

              run();
            });

            describe('upsert', function () {
              it('should pass in the proper arguments and call next("route")', function(done) {
                upsert = function (model, cb) {
                  expect(model).to.equal(result[0]);
                  cb();
                };

                Next = function (err) {
                  expect(err).to.exist;
                  expect(err.status).to.equal(200);
                  done();
                };

                run();
              });


              it('should propogate errors', function(done) {
                var error = 'error';

                upsert = function (model, cb) {
                  cb(error);
                };

                Next = function (err) {
                  expect(err).to.equal(error);
                  done();
                };

                run();
              });
            });
          });
        });
      });
    });
  });
};
