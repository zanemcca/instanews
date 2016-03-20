
/*jshint expr: true*/

var expect = require('chai').expect;
var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var Subarticle = app.models.Subarticle;

function run() {
  return common.req('hooks/subarticle')(app);
}

exports.run = function () {
  describe('Subarticle', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    var observe, afterRemote;
    beforeEach(function() {
      observe = function(hook, cb) {};
      afterRemote = function(hook, cb) {};
      sandbox.stub(Subarticle, 'afterRemote', function(func, cb) {
        return afterRemote(func,cb);
      });

      sandbox.stub(Subarticle, 'observe', function (hook, cb) {
        return observe(hook, cb);
      });
    });

    describe.skip('triggerRating', function() {
      it('should call Stat.updateRating', function() {
        var where = {
          id: 5
        };
        var modify = 'mod';

        var stat = sandbox.stub(app.models.stat, 'updateRating', function(Where, name, Modify, cb) {
          expect(where).to.deep.equal(Where);
          expect(name).to.equal('subarticle');
          expect(modify).to.equal(Modify);
        });

        Subarticle.triggerRating(where, modify, function(err,res) {});
        expect(stat.calledOnce).to.be.true;
      });

      it('should propgate the error from Stat.updateRating', function(done) {
        var where = {
          id: 5
        };
        var err = 'error';
        var res = 'res';

        sandbox.stub(app.models.stat, 'updateRating', function(Where, name, Modify, cb) {
          cb(err, res);
        });

        Subarticle.triggerRating(where, null, function(Err, Res) {
          expect(Err).to.equal(err);
          done();
        });
      });

      it('should create a new 400 error and pass it to the callback', function(done) {
        Subarticle.triggerRating(null, null, function(err, res) {
          expect(err).to.exist;
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should also create a new 400 error and pass it to the callback', function(done) {
        Subarticle.triggerRating({}, null, function(err, res) {
          expect(err).to.exist;
          expect(err.status).to.equal(400);
          done();
        });
      });

      describe('should call Subarticle.find and', function() {
        var err;
        var res;
        var subarticle;
        var where;

        beforeEach(function() {
          where = {
            id: 5
          };
          res = 'res';

          sandbox.stub(app.models.stat, 'updateRating', function(Where, name, Modify, cb) {
            cb(err, res);
          });

          subarticle = function(query, cb) {
            expect(query).to.deep.equal({
              where: where,
              limit: 1
            });
          };

          sandbox.stub(Subarticle, 'find', function(query, cb) {
            return subarticle(query, cb);
          });
        });

        it('should pass in the correct query', function() {
          Subarticle.triggerRating(where, null, null);
          expect(Subarticle.find.calledOnce).to.be.true;
        });

        it('should propgate the error', function(done) {
          Err = 'error';
          subarticle = function(query, cb) {
            cb(Err);
          };

          Subarticle.triggerRating(where, null, function(err, res) {
            expect(Err).to.equal(err);
            done();
          });
        });

        it('should call Article.triggerRating with the proper arguments', function(done) {
          res = [{
            subarticleableId: 'commId',
            subarticleableType: 'subarticle',
          }];

          subarticle = function (query, cb) {
            cb(null, res);
          };

          var callback = function(err, res) {
          };

          sandbox.stub(app.models.article, 'triggerRating', function (where, mod, cb) {
            expect(where).to.deep.equal({ id:res[0].parentId });
            expect(mod).to.be.null;
            cb();
            done();
          });

          Subarticle.triggerRating(where, function(s) {
            return s;
          }, callback);
        });

        it('should return successfully', function(done) {
          res = [];

          subarticle = function (query, cb) {
            cb(null, res);
          };

          Subarticle.triggerRating(where, null, function(err, res) {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });

    describe('afterRemote', function() {
      var remoteMethod;
      var Ctx, Next, Inst;

      beforeEach(function() {
        Ctx = 5;
        Next = function () {};
        Inst = 'instance';

        afterRemote =  function(func, cb) {
          if(func === remoteMethod) {
            cb(Ctx, Inst, Next);
          }
        };
      });

      describe('should call base.createClickAfterRemote and not block', function() {
        beforeEach(function() {
          sandbox.stub(app.models.base, 'createClickAfterRemote', function(ctx, next) {
            expect(ctx).to.equal(Ctx);
            expect(next).to.not.equal(Next);
          });
        });

        it('prototype.__get__comments', function() {
          remoteMethod = 'prototype.__get__comments';
          run();
          expect(app.models.base.createClickAfterRemote.calledOnce).to.be.true;
        });
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
        expect(next.calledOnce).to.be.true;
      });

      /*
      describe.only('before save', function () {
        var cb;

        beforeEach(function () {
          hookName = 'before save';
          //TODO stub aws commands.
          // We can just ensure the proper values are passed in.

          ctx.instance = {
            username: 'user',
            parentId: 'someId',
            id: 'id',
            _file: {
              type: 'video/mp4',
              name: 'video.mp4',
              container: 'videos.container'
            }
          };

        });

        //TODO ensure aws commands are called

        it('should create a .m3u8 source file', function () {
          var sub = ctx.instance;
          run();
          expect(sub._file.sources.length).to.equal(2);
          expect(sub._file.sources[0].indexOf('.m3u8')).to.equal(sub._file.sources[0].length -5);
        });

        //TODO Other formats

        it('should create a .png thumbnail file', function () {
          var sub = ctx.instance;
          run();
          expect(sub._file.sources.thumbnail.indexOf('.png')).to.equal(sub._file.sources[0].length - 4);
        });
      });
     */

      describe('after save', function() {
        var subFind, sub;

        beforeEach(function () {
          ctx.instance._file = {};
          hookName = 'after save';
          subFind = function (query, cb) {};

          sub = sandbox.stub(app.models.subarticle, 'find', function(query, cb) {
            return subFind(query,cb);
          });
        });

        describe('Click.create', function() {
          var click, clickCreate;
          beforeEach(function() {
            clickCreate = function (model, cb) {
              cb();
            };

            click = sandbox.stub(app.models.click, 'create', function(model, cb) {
              clickCreate(model,cb);
            });
          });

          describe('should not call Click.create', function() {
            it('without ctx.instance and ctx.data', function() {
              ctx.instance = null;

              run();
              expect(click.called).to.be.false;
            });

            it('without ctx.isNewInstance', function() {
              ctx.isNewInstance = null;

              run();
              expect(click.called).to.be.false;
            });
          });

          describe('should call Click.create', function() {

            it('should pass in the proper model', function() {
              clickCreate = function(model, cb) {
                expect(model).to.deep.equal({
                  username: ctx.instance.username,
                  type: 'createSubarticle',
                  clickableId: ctx.instance.parentId,
                  clickableType: 'article' 
                });
                cb();
              };
              run();
              expect(click.callCount).to.equal(1);
            });

            it('should propgate the error', function() {
              var error = 'saknfsldgfv';
              clickCreate = function(model, cb) {
                cb(error);
              };

              Next = function(err) {
                if(next.calledOnce) {
                  expect(err).to.equal(error);
                }
              };

              run();
              expect(next.calledOnce).to.be.true;
            });
          });
        });

        describe('Notifications', function() {
          //TODO Unit tests for subarticle notifications
        });
      });
    });
  });
};
