
/*jshint expr: true*/

var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var Storage = {
  disableRemoteMethod: function () {},
  remoteMethod: function () {}
};

var findOne;
function start() {
  Storage = {
    app: {
      models: {
        Subarticle: {
          findOne: findOne 
        },
        Article: {
          clearPending: function (id, next) {
            next();
          }
        }
      }
    },
    disableRemoteMethod: function () {},
    remoteMethod: function () {}
  };

  return common.req('models/storage')(Storage);
}


exports.run = function () {
  describe('Storage', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('initialization', function () {
      var aws = require('aws-sdk');
      var cred = common.req('conf/credentials');
      var err, res, credentials;
      var createJob,
      invoke,
      confirmSubscription;

      beforeEach(function () {
        err = null;
        credentials = {
          key: 'key',
          keyId: 'keyId'
        };

        createJob = function (params, cb) {
          cb(err, res);
        };

        confirmSubscriptions = function(params, cb) {
          cb(err, res);
        };

        invoke = function(params, cb) {
          cb(err, res);
        };

        sandbox.stub(cred, 'get', function (name) {
          return credentials;
        });

        sandbox.stub(aws, 'ElasticTranscoder', function(options) {
          expect(options).to.deep.equal({
            region: 'us-east-1',
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.key
          });

          this.createJob = function(params, cb) {
            createJob(params, cb);
          };

          return this;
        });

        sandbox.stub(aws, 'SNS', function(options) {
          expect(options).to.deep.equal({
            region: 'us-east-1',
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.key
          });

          this.confirmSubscription = function(params, cb) {
            confirmSubscription(params, cb);
          };

          return this;
        });

        sandbox.stub(aws, 'Lambda', function(options) {
          expect(options).to.deep.equal({
            region: 'us-east-1',
            apiVersion: '2015-03-31',
            accessKeyId: credentials.keyId,
            secretAccessKey: credentials.key
          });

          this.invoke = function(params, cb) {
            invoke(params, cb);
          };

          return this;
        });
      });

      describe('triggerTranscoding', function () {
        var run,
        containerName,
        filename,
        cb;

        beforeEach(function () {
          containerName = 'instanews-videos-in';
          filename = 'video.mp4';
          cb = function () {};

          run = function () {
            start();
            Storage.triggerTranscoding(containerName, filename, cb);
          };
        });

        describe('photo', function () {
          beforeEach(function () {
            containerName = 'instanews-photos-in';
          });

          it('should get the photo transcoder paramaters', function (done) {
            invoke = function (params, cb) {
              expect(params).to.exist;
              expect(params.Payload).to.exist;
              done();
            };

            run();
          }); 

          it('should propogate the error', function (done) {
            err = 'error';

            cb = function (error, obj) {
              expect(error).to.equal(err);
              done();
            };

            run();
          });

          it('should call the callback after success', function (done) {
            cb = function (error, obj) {
              expect(error).to.not.exist;
              done();
            };

            run();
          });
        });

        describe('video', function () {
          it('should get the video transcoder paramaters', function (done) {

            createJob = function (params, cb) {
              expect(params).to.exist;
              expect(params.PipelineId).to.exist;
              done();
            };

            run();
          }); 


          it('should not cause a problem if there are not params', function (done) {
            containerName = 'videos.container';

            cb = function (params, cb) {
              expect(params).to.not.exist;
              expect(cb).to.not.exist;
              done();
            };

            run();
          });

          describe('createJob', function () {
            var err, res;
            beforeEach(function () {
              res = {
                Job: {
                  Id: 'id',
                  Outputs: [{
                    Key: 'key1.mp4',
                    ThumbnailPattern: 'key1-{count}'
                  },
                  {
                    Key: 'key2',
                    SegmentDuration: '2'
                  }]
                }
              };

              createJob = function (params, cb) {
                cb(err, res);
              };
            });

            it('should successuflly convert the result', function (done) {
              cb = function (err, obj) {
                expect(obj).to.deep.equal({
                  id: res.Job.Id,
                  container: 'instanews-videos',
                  outputs: [
                    'key1.mp4',
                    'key2.m3u8'
                  ],
                  posters: [
                    'key1-00001.png'
                  ]
                });
                done();
              };

              run();
            });

            it('should propogate the errror', function (done) {
              err = 'error';

              cb = function (error, obj) {
                expect(error).to.equal(err);
                done();
              };

              run();
            });

          });
        });
      }) ;

      describe('clearPending', function () {
        var message;
        var run;
        beforeEach(function () {
          run = function (next) {
            start();
            if(!next) {
              next = function () {};
            }
            Storage.clearPending(message, next);
          };

          message =  {
            jobId: 'id',
            sources: [0 ,1 ,2]
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

        describe('updateAttributes', function () {
          var sub, err, update;

          beforeEach(function () {
            update = function(attr, cb) {
            };

            findOne = function (query, cb) {
              cb(null, sub);
            };

            sub = {
              parentId: 'id',
              updateAttributes: function(attr, cb) {
                update(attr, cb);
              }
            };
          });

          it('should not create an error if the subarticle is not found', function (done) {
            sub = null;

            run(function (error) {
              expect(error).to.not.exist;
              done();
            });
          });

          it('should call updateAttributes on the result from subarticle.findOne with the proper arguments and it should also propogate errors', function (done) {
            err = 'error';

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
            sandbox.stub(Storage.app.models.Article, 'clearPending', function (id,cb) {
              expect(id).to.deep.equal(sub.parentId);
              cb();
            });

            Storage.clearPending(message,done);
          });
        });
      });

      describe('transcodingComplete', function () {
        var run,
        on,
        chunk,
        ctx,
        validate,
        next;

        var MV = require('sns-validator');

        beforeEach(function () {
          chunk = '{ "Type": "SubscriptionConfirmation" }';

          ctx = {
            req: {
              on: function (event, cb) {} 
            }
          };

          next = function (err) {};

          run = function () {
            start();
            Storage.transcodingComplete(ctx, next);
          };

          validate = function(message, cb) {};

          sandbox.stub(MV.prototype, 'validate', function (message, cb) {
            validate(message, cb);
          });

        });

        it('should setup an event listener on "data" and "end"' ,function () {
          sandbox.stub(ctx.req, 'on', function (event, cb) {
            if(ctx.req.on.calledOnce) {
              expect(event).to.equal('data');
            } else {
              expect(event).to.equal('end');
            }
          });

          run();
          expect(ctx.req.on.calledTwice).to.be.true;
        });

        describe('on("end")', function () {
          var job;
          beforeEach(function () {
            err = null;

            validate = function(message, cb) {
              cb(err, job);
            };

            sandbox.stub(ctx.req, 'on', function (event, cb) {
              if(ctx.req.on.calledOnce) {
                cb(chunk);
              } else {
                cb();
              }
            });
          });

          it('should append the chunk on the "data" event which is used by "end"' ,function (done) {
            validate = function(message, cb) {
              expect(message).to.deep.equal(JSON.parse(chunk));
              done();
            };

            run();
          });

          it('should propogate errors from the validator', function (done) {
            err = 'error';

            next = function (error) {
              expect(error).to.equal(err);
              done();
            };

            run();
          });

          describe('SubscriptionConfirmation', function () {
            beforeEach(function () {
              job = {
                Type: 'SubscriptionConfirmation',
                Token: 'token',
                TopicArn: 'arn'
              };
            });

            it('should pass in the proper arguments to sns.confirmSubscription', function (done) {
              confirmSubscription = function (params, cb) {
                expect(params).to.deep.equal({
                  Token: job.Token,
                  TopicArn: job.TopicArn
                });

                cb();
              };

              next = function () {
                done();
              };

              run();
            });

            it('should propogate errors from sns.confirmSubscription', function (done) {
              var err = 'error';

              confirmSubscription = function (params, cb) {
                cb(err);
              };

              next = function (error) {
                expect(error).to.equal(err);
                done();
              };

              run();
            });
          });

          describe('Notification', function () {
            beforeEach(function () {
              job = {
                Type: 'Notification',
                Message: JSON.stringify({
                  jobId: 'id',
                  sources: [0 ,1 ,2]
                }) 
              };

            });

            it('should return an error because the message cannot be parsed', function (done) {
              job.Message = '{ dfgn: "dfddd }';

              next = function (error) {
                expect(error).to.exist;
                done();
              };

              run();
            });

            it('should return a 400 error because the message did not include a jobId', function (done) {
              job.Message = JSON.stringify({ name: 'dfddd' });

              next = function (error) {
                console.log(error);
                expect(error).to.exist;
                expect(error.status).to.equal(400);
                done();
              };

              run();
            });

            it('should call Storage.clearPending with the proper arguments', function (done) {
              start();
              sandbox.stub(Storage, 'clearPending', function (message, cb) {
                expect(message).to.deep.equal(JSON.parse(job.Message));
                cb();
              });

              Storage.transcodingComplete(ctx, function () {
                done();
              });
            });

            it('should propogate the error from Storage.clearPending', function (done) {
              var error = 'errrr';
              start();
              sandbox.stub(Storage, 'clearPending', function (message, cb) {
                cb(error);
              });

              Storage.transcodingComplete(ctx, function (err) {
                expect(err).to.equal(error);
                done();
              });
            });
          });

          it('Should create a 403 error if the notification type is unknown', function (done) {
            job = {
              Type: 'NOT A TYPE'
            };

            next = function (error) {
              expect(error).to.exist;
              expect(error.status).to.equal(403);
              done();
            };

            run();
          });
        });
      });
    });
  });
};
