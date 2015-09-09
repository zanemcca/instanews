
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../common');

var app = common.req('server');
var Article = app.models.Article;

function run() {
  return common.req('hooks/article')(app);
}

exports.run = function () {
  describe('Article', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('triggerRating', function() {
      it('should call Stat.updateRating', function() {
        var where = {
          id: 5
        };
        var modify = 'mod';

        sandbox.stub(app.models.stat, 'updateRating', function(Where, name, Modify, cb) {
          expect(where).to.deep.equal(Where);
          expect(name).to.equal('article');
          expect(modify).to.equal(Modify);
        });

        Article.triggerRating(where, modify, function(err,res) {});
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

        Article.triggerRating(where, null, function(Err, Res) {
            expect(Err).to.equal(err);
            expect(Res).to.equal(res);
            done();
        });
      });

      it('should create a new error and pass it to the callback', function(done) {
        Article.triggerRating(null, null, function(err, res) {
          expect(err).to.exist;
          done();
        });
      });

      it('should also create a new error and pass it to the callback', function(done) {
        Article.triggerRating({}, null, function(err, res) {
          expect(err).to.exist;
          done();
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

          sandbox.stub(Article, 'afterRemote', function(func, cb) {
            if(func !== remoteMethod) {
              cb(Ctx, Inst, Next);
            }
          });

          sandbox.stub(Article, 'observe', function(hook, cb) {
          });
        });

        describe('should call votes.createClickAfterRemote', function() {
          beforeEach(function() {
            sandbox.stub(app.models.votes, 'createClickAfterRemote', function(ctx, next) {
              expect(ctx).to.equal(Ctx);
              expect(next).to.equal(Next);
            });
          });

          it('prototype.__get__comments', function() {
            remoteMethod = 'prototype.__get__comments';
            run();
            expect(app.models.votes.createClickAfterRemote.calledOnce).to.be.true;
          });

          it('prototype.__get__subarticles', function() {
            remoteMethod = 'prototype.__get__subarticles';
            run();
            expect(app.models.votes.createClickAfterRemote.calledOnce).to.be.true;
          });
        });
      });

      describe('observe', function() {
        var hookName;
        var ctx, next;

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
              id: 'id'
            },
            isNewInstance: true
          };

          next = sinon.spy();

          sandbox.stub(Article, 'afterRemote', function(func, cb) {
          });

          sandbox.stub(Article, 'observe', function(hook, cb) {
            if(hook === hookName) {
              cb(ctx, next);
            }
          });
        });

        afterEach(function() {
          expect(next.calledOnce).to.be.true;
        });

        describe('after save', function() {
          var View; 

          beforeEach(function() {
            hookName = 'after save';
            View = {
              username: ctx.instance.username,
              viewableType: 'article',
              viewableId: ctx.instance.id
            };
          });

          beforeEach(function () {
            sandbox.stub(app.models.view, 'create', function(view, cb) {
              expect(view).to.deep.equal(View);
              cb('error');
            });
          });

          it('should create View', function() {
            run();
            expect(app.models.view.create.calledOnce).to.be.true;
          });

          it('should also create View', function() {
            ctx.data = ctx.instance;
            ctx.instance = undefined;
            run();
            expect(app.models.view.create.calledOnce).to.be.true;
          });

          it('should not create a view', function() {
            ctx.isNewInstance = false;
            run();
            expect(app.models.view.create.callCount).to.equal(0);
          });

          it('should also not create a view', function() {
            ctx.instance = undefined;
            run();
            expect(app.models.view.create.callCount).to.equal(0);
          });

          it('should propgate the error', function() {
            thing = {
              func: function (error) {
                expect(error).to.equal('error');
              }
            };

            next = sinon.spy(thing, 'func');

            run();
            expect(next.calledOnce).to.be.true;
          });
        });

        //TODO Finish when loopback_datasource_juggler issue #610 gets resolved
        /*
        describe('access', function() {
          before(function() {
            hookName = 'access';
          });

          it('should convert ctx.query.include into an array', function() {
            next = sinon.stub().returns(
              expect(Array.isArray(ctx.query.include)).to.be.true
            );

            run();
            expect(next.calledOnce).to.be.true;
          });
        });
       */
      });
   });
};
