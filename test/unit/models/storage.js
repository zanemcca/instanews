
/*jshint expr: true*/

var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var Storage = {
  disableRemoteMethod: function () {},
  app: {
    DD: function() {
      return {
        lap: function () {},
        elapsed: function () {},
        increment: function () {},
        decrement: function () {}
      };
    }
  },
  remoteMethod: function () {}
};

var findOne;
function start() {
  Storage = {
    app: {
      debug: function(string) {
        return function() {};
      },
      DD: function() {
        return {
          lap: function () {},
          elapsed: function () {},
          increment: function () {},
          decrement: function () {}
        };
      },
      models: {
        Subarticle: {
          clearPending: function () {},
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

          it('should get the photo transcoder test paramaters', function (done) {
            containerName = 'instanews-photos-test-in';
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

          it('should get the video transcoder test paramaters', function (done) {
            containerName = 'instanews-videos-test-in';
            createJob = function (params, cb) {
              expect(params).to.exist;
              expect(params.PipelineId).to.exist;
              done();
            };

            run();
          }); 

          it('should not combine the names of consecutive video posts', function (done) {
            var callCount = 0;
            createJob = function (params, cb) {
              callCount++;
              if(callCount === 1) {
                expect(params.Outputs[0].Key).to.equal('video-2M');
              } else {
                expect(params.Outputs[0].Key).to.equal('secondVideo-2M');
                done();
              }
            };

            run();
            Storage.triggerTranscoding(containerName, 'secondVideo.mp4', cb);
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

            it('should call Subarticle.clearPending with the proper arguments', function (done) {
              start();
              sandbox.stub(Storage.app.models.Subarticle, 'clearPending', function (message, cb) {
                expect(message).to.deep.equal(JSON.parse(job.Message));
                cb();
              });

              Storage.transcodingComplete(ctx, function () {
                done();
              });
            });

            it('should propogate the error from Subarticle.clearPending', function (done) {
              var error = 'errrr';
              start();
              sandbox.stub(Storage.app.models.Subarticle, 'clearPending', function (message, cb) {
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
