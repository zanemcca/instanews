
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');

var app = common.req('server');
var loopback = require('loopback');
var View = app.models.View;

function run() {
  return common.req('hooks/view')(app);
}

exports.run = function () {
  describe('View', function () {

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
        query: {
          include: {
            relation: 'something'
          }
        },
        options: {
          rate: true
        },
        Model: {
          modelName: 'view'
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
        sandbox.stub(View, 'afterRemote', function(func, cb) {
        });

        sandbox.stub(View, 'observe', function(hook, cb) {
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
          beforeEach(function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return {
                get: function(stat) {
                  expect(stat).to.equal('accessToken');
                  return {
                    userId: 'id'
                  };
                }
              };
            });

            ctx.instance.viewableId =  'someid';
            ctx.instance.viewableType =  'sometype';
          });

          it('should set the username', function() {
            run();

            expect(ctx.instance.username).to.equal('id');
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

          it('not a new instance', function() {
            ctx.isNewInstance = false;
            run();
            expect(next.calledOnce).to.be.true;
          });
        });

        describe('should return a 400 error message', function() {
          beforeEach(function() {
            Next =  function (err) {
              expect(err.http_code).to.equal(400);
            };
          });

          it('no context', function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return null;
            });

            run();
            expect(next.calledOnce).to.be.true;
          });

          it('no accessToken', function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return {
                get: function(stat) {
                  expect(stat).to.equal('accessToken');
                  return null;
                }
              };
            });

            run();
            expect(next.calledOnce).to.be.true;
          });

          it('no viewableType', function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return {
                get: function(stat) {
                  expect(stat).to.equal('accessToken');
                  return {
                    userId: 'id'
                  };
                }
              };
            });

            ctx.instance.viewableId =  'someid';

            run();
            expect(next.calledOnce).to.be.true;
          });

          it('no viewableId', function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return {
                get: function(stat) {
                  expect(stat).to.equal('accessToken');
                  return {
                    userId: 'id'
                  };
                }
              };
            });

            ctx.instance.viewableType = 'sometype';

            run();
            expect(next.calledOnce).to.be.true;
          });
        });
      });

      describe('after delete', function() {
        beforeEach(function () {
          hookName = 'after delete';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        it('should update the parents viewCount', function() {
          var view = sandbox.stub(View, 'updateViewableAttributes', function(ctx, query, Next) {
            expect(query).to.deep.equal({
              '$inc': {
                viewCount: -1
              }
            });

            expect(Next).to.equal(next);
            Next();
          });

          run();

          expect(view.calledOnce).to.be.true;
        });
      });

      describe('after save', function() {
        beforeEach(function() {
          hookName = 'after save';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        it('should update the parents viewCount', function() {
          var view = sandbox.stub(View, 'updateViewableAttributes', function(ctx, query, Next) {
            expect(query).to.deep.equal({
              '$inc': {
                viewCount: 1
              }
            });

            expect(Next).to.equal(next);
            Next();
          });

          run();

          expect(view.calledOnce).to.be.true;
        });

        it('should not call updateViewableAttributes', function() {
          ctx.isNewInstance = false;

          var view = sandbox.spy(View, 'updateViewableAttributes');

          run();
          expect(view.callCount).to.equal(0);
        });

        it('should also not call updateViewableAttributes', function() {
          ctx.instance = null;

          var view = sandbox.spy(View, 'updateViewableAttributes');

          run();
          expect(view.callCount).to.equal(0);
        });
      });
    });

    describe('updateViewableAttributes', function() {
      it('should return a 400 error message', function() {
        ctx.instance = null;
        Next = function (err) {
          expect(err.http_code).to.equal(400);
        };

        View.updateViewableAttributes(ctx, null, next);
        expect(next.calledOnce).to.be.true;
      });

      it('should pass data to viewable.prototype.updateAttributes', function() {
        var Data = 'dazta';

        ctx.instance.viewable = function(cb) {
          cb(null, {
            updateAttributes: function(data, cb) {
              expect(data).to.equal(Data);
              cb();
            }
          });
        };
        View.updateViewableAttributes(ctx, Data, next);
        expect(next.calledOnce).to.be.true;
      });

      describe('should propgate the error', function() {
        var error;
        beforeEach(function() {
          error = 'error';
          Next = function(err) {
            expect(err).to.equal(error);
          };
        });

        afterEach(function() {
          expect(next.calledOnce);
        });

        it('from View.prototype.viewable', function() {
          ctx.instance.viewable = function(cb) {
            cb(error);
          };
          View.updateViewableAttributes(ctx, null, next);
        });

        it('from viewable.prototype.updateAttributes', function() {
          ctx.instance.viewable = function(cb) {
            cb(null, {
              updateAttributes: function(data, cb) {
                cb(error);
              }
            });
          };
          View.updateViewableAttributes(ctx, null, next);
        });
      });
    });
  });
};
