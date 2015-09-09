
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');

var common =  require('../../common');
var app = common.app;

var DownVote = app.models.DownVote;

function run() {
  return common.req('hooks/down-vote')(app);
}

exports.run = function() {
  describe('DownVote', function() {
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

        sandbox.stub(DownVote, 'observe', function(hook, cb) {
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
              downVoteCount: -1
            });
            next();
          });
        });

        it('should call Click.updateVoteParent with a downVoteCount decrement', function(done) {
          Next = done;
          run();
        });
      });

      describe('after save', function() {
        beforeEach(function () {
          hookName = 'after save';

          sandbox.stub(app.models.click, 'updateVoteParent', function(ctx, next) {
            expect(ctx.inc).to.deep.equal({
              downVoteCount: 1,
              clickCount: 1
            });
            next();
          });
        });

        it('should call Click.updateVoteParent with the proper arguments', function(done) {
          ctx.inc = {
            clickCount: 1
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

        it('should return without calling Click.updateVoteParent', function(done) {
          ctx.isNewInstance = false;
          Next = function(err) {
            expect(err).not.to.exist;
            done();
          };

          run();
        });
      });
    });
  });
};
