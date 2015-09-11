
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');
var loopback = require('loopback');

var app = common.req('server');
var loopback = require('loopback');
var Base = app.models.Base;

function run() {
  return common.req('hooks/base')(app);
}

exports.run = function () {
  describe('Base', function () {

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

    beforeEach(function() {
      ctx = {
        query: {
          include: {
            relation: 'something'
          }
        },
        options: {
          rate: true
        },
        Model: {
          modelName: 'base'
        },
        instance: {
          username: 'user',
          id: 'id'
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
        sandbox.stub(Base, 'observe', function(hook, cb) {
          if(hook === hookName) {
            cb(ctx, next);
          }
        });
      });

      describe('access', function() {
        beforeEach(function() {
          hookName = 'access';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        //TODO Finish this
      });

      describe('before save', function() {
        beforeEach(function() {
          hookName = 'before save';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        describe('new instance', function() {
          describe('valid instance' , function() {
            var convertCb, convert;
            var getRatingCb, getRating;
            beforeEach(function() {
              sandbox.stub(loopback, 'getCurrentContext', function () {
                return {
                  get: function(stat) {
                    expect(stat).to.equal('currentStat');
                    return {
                      username: 'user7'
                    };
                  }
                };
              });

              convertCb = function(Model, raw){
                return raw;
              };

              getRatingCb = function(inst, stat){
                return inst;
              };

              convert = sandbox.stub(app.models.stat, 'convertRawStats', function(Model, raw) {
                return convertCb(Model, raw);
              });

              getRating = sandbox.stub(app.models.stat, 'getRating', function (inst, stats) {
                return getRatingCb(inst, stats);
              });
            });

            describe('rating', function() {
              var Model;
              beforeEach(function() {
                convertCb = function (model, raw) {
                  expect(model.modelName).to.equal(Model.modelName);
                };
              });

              afterEach(function() {
                expect(convert.calledOnce).to.be.true;
              });

              describe('should call Stat.convertStats', function () {
                var Models = [
                  app.models.article,
                  app.models.subarticle,
                  app.models.comment
                ];

                Models.forEach(function(model) {
                  it(' for ' + model.modelName, function() {
                    ctx.Model.modelName = model.modelName;
                    Model = model;
                    run();
                  });
                });
              });
            });
          });

          describe('should return a 401 error message', function() {
            beforeEach(function() {
              Next =  function (err) {
                expect(err.http_code).to.equal(401);
              };
            });

            it('no context', function() {
              sandbox.stub(loopback, 'getCurrentContext', function () {
                return null;
              });

              run();
              expect(next.calledOnce).to.be.true;
            });

            it('no stat', function() {
              sandbox.stub(loopback, 'getCurrentContext', function () {
                return {
                  get: function(stat) {
                    expect(stat).to.equal('currentStat');
                    return null;
                  }
                };
              });

              run();
              expect(next.calledOnce).to.be.true;
            });
          });
        });

        describe('should not return an error', function() {
          beforeEach(function() {
            Next =  function (err) {
              expect(err).to.not.exist;
            };
          });

          it('no instance', function() {
            ctx.instance = null;
            run();
            expect(next.calledOnce).to.be.true;
          });
        });
      });

      describe('loaded', function() {
        beforeEach(function() {
          hookName = 'loaded';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        //TODO Finsish this
      });

      /*
      describe('after delete', function() {
        beforeEach(function () {
          hookName = 'after delete';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        it('should update the parents baseCount', function() {
          var base = sandbox.stub(Base, 'updateBaseableAttributes', function(ctx, query, Next) {
            expect(query).to.deep.equal({
              '$inc': {
                baseCount: -1
              }
            });

            expect(Next).to.equal(next);
            Next();
          });

          run();

          expect(base.calledOnce).to.be.true;
        });

        it('should update ctx.inc and not call updateBaseableAttributes', function() {
          ctx.Model.modelName = 'upVote';

          var base = sandbox.spy(Base, 'updateBaseableAttributes');

          run();
          expect(ctx.inc).to.deep.equal({baseCount: -1});
          expect(base.callCount).to.equal(0);
        });
      });
     */
    });

    describe('createClickAfterRemote', function() {
      //TODO
    });
  });
};
