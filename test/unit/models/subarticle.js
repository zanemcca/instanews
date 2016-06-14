
/*jshint expr: true*/

var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var Subarticle = {
  disableRemoteMethod: function () {},
  remoteMethod: function () {}
};

var findOne, find;
function start() {
  Subarticle = {
    app: {
      DD: function() {
        return {
          lap: function () {},
          elapsed: function () {},
          increment: function () {},
          decrement: function () {}
        };
      },
      models: {
        Article: {
          clearPending: function (id, next) {
            next();
          }
        },
        Storage: {
          updateCacheControl: function(container,keys, next) {
            next();
          }
        }
      }
    },
    findOne: findOne,
    find: find,
    disableRemoteMethod: function () {},
    remoteMethod: function () {}
  };

  return common.req('models/subarticle')(Subarticle);
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

    describe('initialization', function () {
      var err;

      beforeEach(function () {
        err = null;
      });

      describe('clearPending', function () {
        var message;
        var notify;
        var run;
        var update;
        var sub;
        beforeEach(function () {
          run = function (next) {
            start();

            sandbox.stub(Subarticle, 'notify', function (inst) {
              notify(inst);
            });

            if(!next) {
              next = function () {};
            }
            Subarticle.clearPending(message, next);
          };
          message = {
            jobId: 'id',
            sources: [0,1,2]
          };

          notify = function () {};

          findOne = function (query, cb) {
            cb(null, sub);
          };

          update = function(attr, cb) {
          };

          sub = {
            parentId: 'id',
            _file: {
              type: 'video/mp4',
              poster: 'hey.png',
              sources: ['src1.m3u8', 'src2.mp4']
            },
            updateAttributes: function(attr, cb) {
              update(attr, cb);
            }
          };
        });

        it('should call Subarticle.findOne with the proper arguments', function (done) {
          findOne = function (query, cb) {
            expect(query).to.deep.equal({
              where: {
                pending: message.jobId
              }
            });
            done();
          };
          run();
        });

        it('should propogate errors from Subarticle.findOne', function (done) {
          var err = 'error';

          findOne = function (query, cb) {
            cb(err);
          };

          run(function (error) {
            expect(error).to.equal(err);
            done();
          });
        });

        it('should call Subarticle.notify with the proper arguments', function () {
          notify = function (inst) {
            expect(inst).to.deep.equal(sub);
          };

          run();
          expect(Subarticle.notify.calledOnce).to.be.true;
        });

        describe('updateAttributes', function () {
          var err;

          it('should not create an error if the subarticle is not found', function (done) {
            sub = null;

            run(function (error) {
              expect(error).to.not.exist;
              done();
            });
          });

          it('should call updateAttributes on the result from subarticle.findOne with the proper arguments and it should also propogate errors', function (done) {
            err = 'error';
            sub._file.type = 'image/jpeg';

            update = function(attr, cb) {
              expect(attr).to.deep.equal({
                $unset: {
                  pending: ''
                },
                $set: {
                  '_file.sources': [0,1,2]
                }
              });
              cb(err);
            };

            run(function (error) {
              expect(error).to.equal(err);
              done();
            });
          });

          it('should call Article.clearPending with the proper arguments', function (done) {
            update = function(attr, cb) {
              cb();
            };

            start();
            sandbox.stub(Subarticle.app.models.Article, 'clearPending', function (id,cb) {
              expect(id).to.deep.equal(sub.parentId);
              cb();
            });

            sandbox.stub(Subarticle, 'notify', function (inst) {
              notify(inst);
            });

            Subarticle.clearPending(message,done);
          });
        });
      });
    });
  });
};
