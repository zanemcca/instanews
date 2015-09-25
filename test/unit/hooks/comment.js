
/*jshint expr: true*/

var expect = require('chai').expect;
var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var Comment = app.models.Comment;

function run() {
  return common.req('hooks/comment')(app);
}

exports.run = function () {
  describe('Comment', function () {

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
      sandbox.stub(Comment, 'afterRemote', function(func, cb) {
        return afterRemote(func,cb);
      });

      sandbox.stub(Comment, 'observe', function (hook, cb) {
        return observe(hook, cb);
      });
    });

    describe('triggerRating', function() {
      it('should call Stat.updateRating', function() {
        var where = {
          id: 5
        };
        var modify = 'mod';

        var stat = sandbox.stub(app.models.stat, 'updateRating', function(Where, name, Modify, cb) {
          expect(where).to.deep.equal(Where);
          expect(name).to.equal('comment');
          expect(modify).to.equal(Modify);
        });

        Comment.triggerRating(where, modify, function(err,res) {});
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

        Comment.triggerRating(where, null, function(Err, Res) {
            expect(Err).to.equal(err);
            done();
        });
      });

      it('should create a new 400 error and pass it to the callback', function(done) {
        Comment.triggerRating(null, null, function(err, res) {
          expect(err).to.exist;
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should also create a new 400 error and pass it to the callback', function(done) {
        Comment.triggerRating({}, null, function(err, res) {
          expect(err).to.exist;
          expect(err.status).to.equal(400);
          done();
        });
      });

      describe('should call Comment.find and', function() {
        var err;
        var res;
        var comment;
        var where;

        beforeEach(function() {
          where = {
            id: 5
          };
          res = 'res';

          sandbox.stub(app.models.stat, 'updateRating', function(Where, name, Modify, cb) {
            cb(err, res);
          });

          comment = function(query, cb) {
            expect(query).to.deep.equal({
              where: where,
              limit: 1
            });
          };

          sandbox.stub(Comment, 'find', function(query, cb) {
            return comment(query, cb);
          });
        });

        it('should pass in the correct query', function() {
          Comment.triggerRating(where, null, null);
          expect(Comment.find.calledOnce).to.be.true;
        });

        it('should propgate the error', function(done) {
          Err = 'error';
          comment = function(query, cb) {
            cb(Err);
          };

          Comment.triggerRating(where, null, function(err, res) {
            expect(Err).to.equal(err);
            done();
          });
        });

        it('should call Stat.triggerRating with the proper arguments', function(done) {
          res = [{
            commentableId: 'commId',
            commentableType: 'subarticle',
          }];
          
          comment = function (query, cb) {
            cb(null, res);
          };

          var callback = 'cb';
          sandbox.stub(app.models.stat, 'triggerRating', function (where, type, mod, cb) {
            expect(where).to.deep.equal({ id:res[0].commentableId });
            expect(type).to.equal(res[0].commentableType);
            expect(mod).to.be.null;
            expect(cb).to.equal(callback);
            done();
          });

          Comment.triggerRating(where, function(s) {
            return s;
          }, callback);
        });

        it('should return successfully', function(done) {
          res = [];
          
          comment = function (query, cb) {
            cb(null, res);
          };

          Comment.triggerRating(where, null, function(err, res) {
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
        Next = 'A';
        Inst = 'instance';

        afterRemote =  function(func, cb) {
          if(func === remoteMethod) {
            cb(Ctx, Inst, Next);
          }
        };
      });

      describe('should call base.createClickAfterRemote', function() {
        beforeEach(function() {
          sandbox.stub(app.models.base, 'createClickAfterRemote', function(ctx, next) {
            expect(ctx).to.equal(Ctx);
            expect(next).to.equal(Next);
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
          options: {
            rate: true
          },
          instance: {
            username: 'user',
            commentableId: 'someid',
            commentableType: 'sometype',
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
        expect(next.calledTwice).to.be.true;
      });

      describe('after save', function() {
        describe('Click.create', function() {
          var click, clickCreate;
          beforeEach(function() {
            clickCreate = function (model, cb) {
              cb();
            };

            hookName = 'after save';

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
                  clickableId: ctx.instance.commentableId,
                  clickableType: ctx.instance.commentableType
                });
                cb();
              };
              run();
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
              expect(next.calledTwice).to.be.true;
            });
          });
        });

        describe('Notifications', function() {
          //TODO Unit tests for comment notifications
        });
      });
    });
  });
};
