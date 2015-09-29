
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');

var app = common.req('server');

var Common = common.req('models/common');

//TODO Complete the tests for common
exports.run = function () {
  describe('Common', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('readModifyWrite', function() {
      var run,
      Model,
      query,
      modify,
      cb,
      options;
      beforeEach(function() {
        Model = {
          find: function (query, cb) {
            cb(null, []);
          },
          updateAll: function(where, instance, cb) {
            cb(null, { count: 1 });
          }
        };
        query = {
          where: {
            id: 5
          }
        };
        cb = function(err, res) {};
        modify = function( model) {
          return model;
        };

        run = function () {
          Common.readModifyWrite(Model, query, modify, cb, options);
        };
      });

      describe('Model.find', function () {

        it('should propogate the error from Model.find' , function (done) {
          var err = 'errorlsfdfsdgfdgdag';
          Model.find = function (query, cb) {
            cb(err);
          };

          cb = function(err, res) {
            expect(err).to.equal(err);
            done();
          };
          run();
        });

        it('should pass in the proper arguments' , function (done) {
          Model.find = function (qry, cb) {
            expect(qry).to.deep.equal(query);
            done();
          };

          run();
        });

        describe('valid model(s)', function() {
          var models;
          beforeEach(function () {
            models = [];
            Model.find = function (qry, cb) {
              cb(null, models);
            };
          });

          it('should call the cb a count of 0', function(done) {
            cb = function(err,res) {
              expect(res).to.equal(0);
              done(err);
            };
            run();
          });

          it('should return a cb of 1' , function (done) {
            models = [{
              id: 5,
              version: 0
            }];

            cb = function(err,res) {
              expect(res).to.equal(1);
              done(err);
            };
            run();
          });

          //TODO INvestigate and fix this
          it.skip('should also return a cb of 1 after retrying' , function (done) {
            models = [{
              id: 5,
              version: 0
            }];

            cb = function(err,res) {
              console.log(res);
              expect(res).to.equal(1);
              done(err);
            };

            options = {
              retryCount: 1
            };

            var first = true;
            var res;
            Model.updateAll = function (where, instance, cb) {
              res = {
                count: 1,
              };
              if(first) {
                first = false;
                res.count = 0;
              }
              cb(null, res);
            };

            run();
          });
        });
      });
    });
  });
};
