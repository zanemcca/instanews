
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');

var app = common.req('server');
var loopback = require('loopback');
var Click = app.models.Click;
var Base = app.models.Base;

function run() {
  return common.req('hooks/click')(app);
}

exports.run = function () {
  describe('Click', function () {

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
          modelName: 'click'
        },
        instance: {
          username: 'user',
          type: 'getComments',
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
        sandbox.stub(Click, 'afterRemote', function(func, cb) {
        });

        sandbox.stub(Click, 'observe', function(hook, cb) {
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
          expect(next.calledTwice).to.be.true;
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

            ctx.instance.clickableId =  'someid';
            ctx.instance.clickableType = 'sometype';
          });

          describe('preVoteChecker', function() {
            var down, up, upCB;
            beforeEach(function() {
              upCB = function(cb){
                cb();
              };

              ctx.Model.modelName = 'upVote';

              sandbox.stub(app.models.view, 'findOne', function(r, cb){
                cb(null, 1);
              });

              up = sandbox.stub(app.models.upVote, 'findOne', function(filter, cb) {
                return upCB(cb);
              });
              down = sandbox.stub(app.models.downVote, 'findOne', function(filter, cb){
                cb();
              });
            });

            it('should call downVote.findOne', function() {
              run();
              expect(down.calledOnce).to.be.true;
            });

            it('should call upVote.findOne', function() {
              ctx.Model.modelName = 'downVote';

              run();
              expect(up.calledOnce).to.be.true;
            });

            it('should not call either upVote or downVote.findOne', function() {
              ctx.Model.modelName = 'click';

              run();
              expect(up.called).to.be.false;
              expect(down.called).to.be.false;
            });

            it('should call upVote.findOne, ' +
               'then upVote.prototype.destroy. Which should succeed', function() {
              ctx.Model.modelName = 'downVote';
              upCB = function (cb) {
                cb(null ,{
                  destroy: function (cb){
                    cb();
                  }
                });
              };

              Next =  function (err) {
                expect(err).to.not.exist;
              };

              run();

              expect(up.calledOnce).to.be.true;
              expect(next.calledTwice).to.be.true;
            });

            describe('should propgate the error', function() {
              var ne, error;
              beforeEach(function() {
                Next = function (err) {
                  if(next.calledOnce) {
                    expect(err).to.equal(error);
                  }
                };

                error = 'error';
                upCB = function(cb) {
                  cb(error);
                };
              });

              it('from second.prototype.destroy', function() {
                ctx.Model.modelName = 'downVote';
                upCB = function (cb) {
                  cb(null ,{
                    destroy: function (cb){
                      cb(error);
                    }
                  });
                };

                run();

                expect(up.calledOnce).to.be.true;
                expect(next.calledTwice).to.be.true;
              });
              
              it('from the OppositeModel.find', function() {
                ctx.Model.modelName = 'downVote';

                run();
                expect(up.calledOnce).to.be.true;
                expect(next.calledTwice).to.be.true;
              });
            });
          });

          describe('View.findOne', function() {
            var viewCB, createCB;
            beforeEach(function() {
              viewCB = function(filter, cb) {
                expect(filter).to.deep.equal({
                  where: { 
                    username: ctx.instance.username,
                    viewableId: ctx.instance.clickableId,
                    viewableType: ctx.instance.clickableType
                  },
                  order: 'id DESC'
                });

                cb();
              };

              sandbox.stub(app.models.view, 'findOne', function(filter, cb){
                viewCB(filter, cb);
              });

              sandbox.stub(app.models.view, 'create', function(mod, cb){
                createCB(mod, cb);
              });

              sandbox.stub(app.models.upVote, 'findOne', function(filter, cb) {
                cb();
              });
              sandbox.stub(app.models.downVote, 'findOne', function(filter, cb){
                cb();
              });
            });

            describe('View.create', function () {
              it('should propgate the error', function() {
                var error = 'error';

                Next = function (err) {
                  if(next.calledTwice) {
                    expect(err).to.equal(error);
                  }
                };

                createCB = function(mod, cb) {
                  console.log('error');
                  cb(error);
                };

                run();
                expect(next.calledTwice).to.be.true;
              });

              it.skip('should return a  error message', function() {
                Next = function (err) {
                  if(next.calledTwice) {
                    expect(err.status).to.equal(403);
                  }
                };

                run();

                expect(next.calledTwice).to.be.true;
              });
            });

            it('should propgate the error', function() {
              var error = 'error';

              Next = function (err) {
                if(next.calledTwice) {
                  expect(err).to.equal(error);
                }
              };

              viewCB = function(filter, cb) {
                console.log('error');
                cb(error);
              };

              run();
              expect(next.calledTwice).to.be.true;
            });

            it('should set the viewId', function() {
              var view = {
                id: 'viewId',
                viewableType: 'article',
                viewableId: 'articleId'
              };

              viewCB = function(filter, cb) {
                cb(null, view);
              };

              run();

              expect(ctx.instance.viewId).to.equal(view.id);
              expect(ctx.instance.clickableType).to.equal(view.viewableType);
              expect(ctx.instance.clickableId).to.equal(view.viewableId);
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
            expect(next.calledTwice).to.be.true;
          });

          it('not a new instance', function() {
            ctx.isNewInstance = false;
            run();
            expect(next.calledTwice).to.be.true;
          });
        });

        describe('should return a 400 error message', function() {
          beforeEach(function() {
            Next =  function (err) {
              if(next.calledTwice) {
                expect(err.status).to.equal(400);
              }
            };
          });

          it('no context', function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return null;
            });

            run();
            expect(next.calledTwice).to.be.true;
          });

          it('no stat', function() {
            sandbox.stub(loopback, 'getCurrentContext', function () {
              return {
                get: function(stat) {
                  expect(stat).to.equal('accessToken');
                  return null;
                }
              };
            });

            run();
            expect(next.calledTwice).to.be.true;
          });

          it('no clickableType', function() {
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

            ctx.instance.clickableId =  'someid';

            run();
            expect(next.calledTwice).to.be.true;
          });

          it('no clickableId', function() {
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

            ctx.instance.clickableType = 'sometype';

            run();
            expect(next.calledTwice).to.be.true;
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

        it('should update the parents getCommentsCount', function() {
          var click = sandbox.stub(Click, 'updateClickableAttributes', function(ctx, query, Next) {
            expect(query).to.deep.equal({
              '$inc': {
                getCommentsCount: -1
              }
            });

            //expect(Next).to.equal(next);
            Next();
          });

          run();

          expect(click.calledOnce).to.be.true;
        });

        it('should update ctx.inc and not call updateClickableAttributes', function() {
          ctx.Model.modelName = 'upVote';

          delete ctx.instance.type;
          var click = sandbox.spy(Click, 'updateClickableAttributes');

          run();
          expect(ctx.inc).to.deep.equal({});
          expect(click.callCount).to.equal(0);
        });
      });

      describe('after save', function() {
        beforeEach(function() {
          hookName = 'after save';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        it('should update the parents clickCount', function() {
          var click = sandbox.stub(Click, 'updateClickableAttributes', function(ctx, query, Next) {
            expect(query).to.deep.equal({
              '$inc': {
                getCommentsCount: 1
              }
            });

            //expect(Next).to.equal(next);
            Next();
          });

          run();

          expect(click.calledOnce).to.be.true;
        });

        it('should update ctx.inc and not call updateClickableAttributes', function() {
          ctx.Model.modelName = 'upVote';

          delete ctx.instance.type;
          var click = sandbox.spy(Click, 'updateClickableAttributes');

          run();
          expect(ctx.inc).to.deep.equal({});
          expect(click.callCount).to.equal(0);
        });

        it('should not update  ctx.inc and not call updateClickableAttributes', function() {
          ctx.isNewInstance = false;

          var click = sandbox.spy(Click, 'updateClickableAttributes');

          run();
          expect(ctx.inc).to.be.undefined;
          expect(click.callCount).to.equal(0);
        });

        it('should also not update  ctx.inc and not call updateClickableAttributes', function() {
          ctx.instance = null;

          var click = sandbox.spy(Click, 'updateClickableAttributes');

          run();
          expect(ctx.inc).to.be.undefined;
          expect(click.callCount).to.equal(0);
        });
      });
    });

    describe('updateVoteParent', function() {
      afterEach(function() {
        expect(next.calledOnce).to.be.true;
      });

      it('should not call updateClickableAttributes', function() {
        var click = sandbox.stub(Click, 'updateClickableAttributes', function(ctx, data, next) {});

        ctx.instance = null;

        Click.updateVoteParent(ctx,next);

        expect(click.called).to.be.false;
      });

      it('should call updateClickableAttributes and it should propgate its error', function() {
        var error = 'error';
        Next =  function (err) {
          expect(err).to.equal(error);
        };

        var click = sandbox.stub(Click, 'updateClickableAttributes', function(ctx, data, next) {
          next(error);
        });

        Click.updateVoteParent(ctx,next);

        expect(click.calledOnce).to.be.true;
        expect(next.calledOnce).to.be.true;
      });
    });

    describe('updateClickableAttributes', function() {
      beforeEach(function () {
        ctx.instance.clickableType = 'someType';

        var defer = sandbox.stub(Base, 'deferUpdate', function (id, type, opts, cb) {
          cb();
        });
      });

      it('should return a 400 error message', function() {
        ctx.instance = null;
        Next = function (err) {
          expect(err.status).to.equal(400);
        };

        Click.updateClickableAttributes(ctx, null, next);
        expect(next.calledOnce).to.be.true;
      });

      it('should pass data to clickable.prototype.updateAttributes', function() {
        var Data = 'dazta';

        ctx.instance.clickable = function(cb) {
          cb(null, {
            updateAttributes: function(data, cb) {
              expect(data).to.equal(Data);
              cb();
            }
          });
        };


        Click.updateClickableAttributes(ctx, Data, next);
        expect(next.calledOnce).to.be.true;
      });

      describe('nearBy', function() {
        var clickable, data;
        beforeEach(function() {
          ctx.Model.modelName = 'upVote';
          ctx.instance.clickableType = 'upVote';
          clickable = {
            modelName: 'article',
            verified: false,
            location: {
              lat: 45,
              lng: -67
            },
            updateAttributes: function(data, cb) {cb();}
          };

          ctx.instance.location = {
            lat: 45,
            lng: -67
          };

          ctx.instance.clickable = function(cb) {
            cb(null, clickable);
          };

          data = {};
        });

        it('it should verify an article within 500m' , function(done) {
          Click.updateClickableAttributes(ctx, data, function(err) {
            expect(data.$set).to.exist;
            expect(data.$set.verified).to.be.true;
            done();
          });
        });

        it('it should verify an article while maintaining the current data.$set' , function() {
          data.$set = {
            cantelope: 10
          };

          Click.updateClickableAttributes(ctx, data, next);
          expect(data.$set.cantelope).to.equal(10);
          expect(data.$set.verified).to.be.true;
        });

        it('it should verify an article exactly 500m' , function() {
          ctx.instance.location = {
            lat: 45,
            lng: -66.9936409
          };

          Click.updateClickableAttributes(ctx, data, next);
          expect(data.$set).to.exist;
          expect(data.$set.verified).to.be.true;
        });

        it('it should not verify an article farther than 500m', function() {
          ctx.instance.location = {
            lat: 44,
            lng: -66.99364
          };

          Click.updateClickableAttributes(ctx, data, next);
          expect(data.$set).to.not.exist;
        });

        it('it should not verify if the instance location is missing', function() {
          ctx.instance.location = null;

          Click.updateClickableAttributes(ctx, data, next);
          expect(data.$set).to.not.exist;
        });
      });

      //TriggerRating was deprecated
      describe.skip('stat.triggerRating' , function() {
        beforeEach(function() {
          ctx.instance.clickable = function(cb) {
            cb(null, {
              updateAttributes: function(data, cb) {
                cb();
              }
            });
          };
        });

        it('should pass in the proper arguments', function() {
          var stat = sandbox.stub(app.models.stat, 'triggerRating', function(where, type, mod, cb) {
            expect(where).to.deep.equal({
              id: ctx.instance.clickableId
            });
            expect(type).to.equal(ctx.instance.clickableType);
            expect(mod).to.be.null;
            cb();
          });

          Click.updateClickableAttributes(ctx, null, next);
          expect(stat.calledOnce).to.be.true;
        });
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

        it('from Click.prototype.clickable', function() {
          ctx.instance.clickableType = 'upVote';
          ctx.instance.type = null;
          ctx.Model.modelName = 'upVote';
          ctx.instance.clickable = function(cb) {
            cb(error);
          };

          Click.updateClickableAttributes(ctx, null, next);
        });

        it('from clickable.prototype.updateAttributes', function() {
          ctx.instance.type = null;
          ctx.instance.clickableType = 'upVote';
          ctx.Model.modelName = 'upVote';
          ctx.instance.clickable = function(cb) {
            cb(null, {
              updateAttributes: function(data, cb) {
                cb(error);
              }
            });
          };
          Click.updateClickableAttributes(ctx, null, next);
        });

        it.skip('from Stat.triggerRating', function() {
          ctx.instance.clickable = function(cb) {
            cb(null, {
              updateAttributes: function(data, cb) {
                cb();
              }
            });
          };
          var stat = sandbox.stub(app.models.stat, 'triggerRating', function(where, type, mod, cb) {
            cb(error);
          });

          Click.updateClickableAttributes(ctx, null, next);
          expect(stat.calledOnce).to.be.true;
        });
      });
    });
  });
};
