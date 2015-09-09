
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');

var common =  require('../../common');
var app = common.app;

var UpVote = app.models.UpVote;

function run() {
  return common.req('hooks/up-vote')(app);
}

exports.run = function() {
  describe('UpVote', function() {
    describe('Observe', function() {

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
      var hookName;

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

        sandbox.stub(UpVote, 'observe', function(hook, cb) {
          if(hook === hookName) {
            cb(ctx, next);
          }
        });
      });

      describe('after delete', function() {
        beforeEach(function () {
          hookName = 'after delete';

          sandbox.stub(app.models.click, 'updateVoteParent', function(ctx, next) {
            expect(ctx.inc).to.deep.equal({
              upVoteCount: -1,
              clickCount: -1
            });
            next();
          });
        });

        it('should call Click.updateVoteParent with a upVoteCount decrement', function(done) {
          ctx.inc = {
            clickCount: -1
          };
          Next = done;
          run();
        });

        it('should return a 400 error code because ctx.inc was not set before the call', function(done) {
          Next = function(err) {
            expect(err.http_code).to.equal(400);
            done();
          };
          run();
        });
      });

      describe('after save', function() {
        beforeEach(function () {
          hookName = 'after save';

          sandbox.stub(app.models.click, 'updateVoteParent', function(ctx, next) {
            expect(ctx.inc).to.deep.equal({
              upVoteCount: 1,
              clickCount: 1
            });
            next();
          });
        });

        afterEach(function() {
          expect(next.calledTwice).to.be.true;
        });

        it('should call Click.updateVoteParent with the proper arguments', function() {
          ctx.inc = {
            clickCount: 1
          };
          run();
        });

        it('should return a 400 error code because ctx.inc was not set before the call', function() {
          Next = function(err) {
            if(next.calledOnce) {
              expect(err.http_code).to.equal(400);
            }
          };
          run();
        });

        it('should return without calling Click.updateVoteParent', function() {
          ctx.isNewInstance = false;
          Next = function(err) {
            if(next.calledOnce) {
              expect(err).not.to.exist;
            }
          };

          run();
        });

        describe('notifications', function() {
          //TODO Notification unit testing
        });
      });
    });
  });
};
