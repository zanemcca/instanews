
/*jshint expr: true*/

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');

var common =  require('../../common');

exports.run = function () {
  describe('errorHandler', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    var 
      err,
      req,
      res, 
      next,
      Next,
      options,
      run;

    beforeEach(function() {
      req = 'request';
      res = {
        status: function (code) {},
        send: function(data) {}
      };

      err = new Error('404 error');
      err.status = 404;

      Next = function(err) {};
      var ne = {
        xt: function(err) {
          Next(err);
        }
      };
      next = sandbox.spy(ne, 'xt');

      run = function () {
        return common.req('middleware/errorHandler')(options)(err, req, res, next);
      };

    });

    if(process.env.NODE_ENV === 'staging' ||
       process.env.NODE_ENV === 'production') {

      describe(process.env.NODE_ENV + ' mode', function () {
        var old_NODE_ENV;
        beforeEach(function() {
          old_NODE_ENV = process.env.NODE_ENV;
          process.env.NODE_ENV = 'production';
        });

        afterEach(function() {
          process.env.NODE_ENV = old_NODE_ENV;
        });

        it('should return the error with a 404', function (done) {
          res.send = function (e) {
            expect(res.statusCode).to.equal(err.status);
            done();
          };

          run();
        });

        it('should return the error with a modified error message', function (done) {
          res.send = function (e) {
            expect(e.message).to.not.equal(err.message);
            done();
          };
          run();
        });
      });
    } else {
      describe('development mode', function () {
        it('should call next with the error', function (done) {
          Next = function (e) {
            expect(e).to.equal(err);
            done();
          };
          run();
        });
      });
    }
  });
};
