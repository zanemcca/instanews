
/*jshint expr: true*/

var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;
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
        options: {},
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

        describe('ctx.query.limit', function () {
          it('should reduce the limit to the maximum', function () {
            ctx.query.limit = 5000;
            run();
            expect(ctx.query.limit).to.equal(300);
          });

          it('should set the limit to the maximum', function () {
            run();
            expect(ctx.query.limit).to.equal(300);
          });

          it('should not modify the limit', function () {
            ctx.query.limit = 299;
            run();
            expect(ctx.query.limit).to.equal(299);
          });
        });

        describe('ctx.query.include', function () {
          it('should create a new empty array', function () {
            delete ctx.query.include;
            run();
            expect(Array.isArray(ctx.query.include)).to.be.true;
            expect(ctx.query.include.length).to.equal(0);
          });

          it('should convert include into an array', function () {
            run();
            expect(ctx.query.include).to.deep.equal([
              {
                 relation: 'something'
              }
            ]);
          });

          it('should not change include', function () {
            ctx.query.include = [ctx.query.include];

            run();
            expect(ctx.query.include).to.deep.equal([
              {
                 relation: 'something'
              }
            ]);
          });
        });

        describe('authenticated user', function () {
          var stat;
          beforeEach(function () {
            token = {
              userId: 'user7'
            };

            sandbox.stub(loopback, 'getCurrentContext', function () {
              return {
                get: function(name) {
                  expect(name).to.equal('accessToken');
                  return token;
                }
              };
            });
          });

          it('should include upVotes and downVotes of the user', function () {
            run();
            expect(ctx.query.include.length).to.equal(3);
            expect(ctx.query.include[1]).to.deep.equal({
              relation: 'upVotes',
              scope: {
                where: {
                  username: token.userId 
                }
              }
            });

            expect(ctx.query.include[2]).to.deep.equal({
              relation: 'downVotes',
              scope: {
                where: {
                  username: token.userId 
                }
              }
            });
          });

          it.skip('should include comments', function () {
            ctx.query.rate = true;

            run();
            expect(ctx.query.include.length).to.equal(4);
            expect(ctx.query.include[3]).to.deep.equal({
              relation: 'comments',
              scope: {
                limit: stat.comment.views.mean,
                order: 'rating DESC'
              }
            });
          });
        });

        it.skip('should set ctx.options.rate', function () {
          ctx.query.rate = true;
          run();
          expect(ctx.options.rate).to.be.true;
        });
      });

      describe('before save', function() {
        beforeEach(function() {
          hookName = 'before save';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        it('should update modified and ratingModified dates', function() {
          run();
          expect(ctx.instance.modified).to.equalDate(new Date());
          expect(ctx.instance.ratingModified).to.equalDate(new Date());
        });

        it('should delete comments and subarticles', function() {
          ctx.instance.comments = 'comments';
          ctx.instance.subarticles = 'subarticles';
          run();
          expect(ctx.instance.comments).to.not.exist;
          expect(ctx.instance.subarticles).to.not.exist;
        });

        describe('new instance', function() {
          describe('valid instance' , function() {
            var convertCb, convert;
            var getRatingCb, getRating;
            beforeEach(function() {
              sandbox.stub(loopback, 'getCurrentContext', function () {
                return {
                  get: function(name) {
                    expect(name).to.equal('accessToken');
                    return {
                      userId: 'user7'
                    };
                  }
                };
              });

              convertCb = function(Model, raw){
                return raw;
              };

              getRatingCb = function(inst){
                rating = 0.75;
                return rating;
              };

              getRating = sandbox.stub(app.models.stat, 'getRating', function (inst) {
                return getRatingCb(inst);
              });
            });

            it('should initialize the instance', function() {
              run();

              var inst = ctx.instance;
              expect(inst.modelName).to.equal(ctx.Model.modelName);
              expect(inst.username).to.equal('user7');
              expect(inst.version).to.equal(0);
              expect(inst.ratingVersion).to.equal(0);
              expect(inst.created).to.equalDate(new Date());
              //expect(inst.clickCount).to.equal(0);
              expect(inst.viewCount).to.equal(0);
              expect(inst.upVoteCount).to.equal(0);
              expect(inst.downVoteCount).to.equal(0);
              expect(inst.rating).to.equal(0.75);
            });

              /*
            describe('rating', function() {
              var Model;
              beforeEach(function() {
                convertCb = function (model, raw) {
                  expect(model.modelName).to.equal(Model.modelName);
                  return 'converted';
                };
              });

              afterEach(function() {
               // expect(convert.calledOnce).to.be.true;
                expect(getRating.calledOnce).to.be.true;
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

              describe('should pass the converted stats to Stat.getRating', function() {
                getRatingCb = function(inst, stat) {
                  //expect(stat).to.equal('converted');
                  expect(stat).to.equal();
                };
                run();
              });
            });
             */
          });

          describe('should return a 401 error message', function() {
            beforeEach(function() {
              Next =  function (err) {
                expect(err.status).to.equal(401);
              };
            });

            it('no context', function() {
              sandbox.stub(loopback, 'getCurrentContext', function () {
                return null;
              });

              run();
              expect(next.calledOnce).to.be.true;
            });

            it('no token', function() {
              sandbox.stub(loopback, 'getCurrentContext', function () {
                return {
                  get: function(name) {
                    expect(name).to.equal('accessToken');
                    return null;
                  }
                };
              });

              run();
              expect(next.calledOnce).to.be.true;
            });
          });
        });

        describe('is not a new instance', function() {
          beforeEach(function () {
            ctx.isNewInstance = false;
            ctx.data = {
              $inc: {
                upVoteCount: 1
              },
              $set: {
                something: true
              }
            };
          });

          it('should delete ctx.data.version', function () {
            ctx.data.version = 5;
            run();
            expect(ctx.data.version).to.not.exist;
          });

          it('should set ctx.data.$inc.version and ctx.data.$set to ctx.data', function () {
            delete ctx.data.$inc;
            ctx.data = ctx.data.$set;

            run();
            expect(ctx.data.$inc.version).to.equal(1);
            expect(ctx.data.$set.something).to.be.true;
          });

          it('should add version to ctx.data.$inc', function () {
            run();
            expect(ctx.data.$inc.version).to.equal(1);
            expect(ctx.data.$inc.upVoteCount).to.equal(1);
            expect(ctx.data.$set.something).to.be.true;
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

      /*
      describe('loaded', function() {
        beforeEach(function() {
          hookName = 'loaded';
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        describe('rate option', function() {
          var rating, ratingCb;
          beforeEach(function () {
            ctx.options.rate = true;
            ratingCb = function(Model, instance, cb) {
              cb();
            };

            rating = sandbox.stub(app.models.stat, 'getCustomRating', function(Model, instance, cb) {
              ratingCb(Model, instance, cb);
            });
          });

          it('should propagate the error frome Stat.getCustomRating', function (done) {
            var error = 'error';
            ratingCb = function(m, i,cb) {
              cb(error);
            };

            Next = function(err) {
              expect(err).to.equal(error);
              done();
            };

            run();
          });

          it('should update the rating', function() {
            var custom = {
              rating: 555
            };

            ratingCb = function(m, i, cb) {
              cb(null, custom);
            };

            run();
            expect(ctx.instance.rating).to.equal(custom.rating);
          });

          it('should not call Stat.getCustomRating', function () {
            ctx.options.rate = false;
            run();
            expect(rating.called).to.be.false;
          });
        });
      });
     */

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
      var click, clickCb, stat, context;
      beforeEach(function () {
        ctx.req = {
          remotingContext: {
            instance: {
              id: 'someid',
              modelName: 'aModel'
            }
          }
        };

        run = function(cb) {
          return Base.createClickAfterRemote(ctx, cb);
        };

        clickCb = function (click, cb) {
          cb();
        };

        click = sandbox.stub(app.models.click, 'create', function ( click, cb) {
          clickCb(click, cb);
        });

        token = {
          userId: 'user6'
        };

        context = {
          get: function(name) {
            expect(name).to.equal('accessToken');
            return token;
          }
        };

        sandbox.stub(loopback, 'getCurrentContext', function () {
          return context;
        });
      });

      it('should create a click' , function (done) {
        run(function(err) {
          expect(click.calledOnce).to.be.true;
          done();
        });
      });

      it('should not create a click' , function (done) {
        context = null;
        run(function(err) {
          expect(click.called).to.be.false;
          done();
        });
      });

      it('should also not create a click' , function (done) {
        token = null;
        run(function(err) {
          expect(click.called).to.be.false;
          done();
        });
      });

      it('should propagate an error from click' , function (done) {
        var error = 'an error';
        clickCb = function(click, cb) {
          cb(error);
        };

        run(function (err) {
          expect(err).to.equal(error);
          done();
        });
      });

      it('should return a 403 error code', function (done) {
        delete ctx.req.remotingContext;
        run( function (err) {
          expect(err.status).to.equal(403);
          done();
        });
      });
    });
  });
};
