
var common = require('./common');
var cred = require('../conf/credentials');
var crypto = require('crypto');
var aws = require('aws-sdk');
var async = require('async');
var MessageValidator = require('sns-validator');

/* jshint camelcase: false */

module.exports = function(Storage) {

  var staticDisable = [
    'getContainers',
    'getContainer',
    'createContainer',
    'destroyContainer',
    'getFiles',
    'removeFile',
    'getFile'
  ];

  common.disableRemotes(Storage, staticDisable,true);

  var validator = new MessageValidator();

  var transcoder,
  s3,
  sns,
  lambda;

  var credentials = cred.get('aws');
  if(credentials) {
    s3 = new aws.S3({
      apiVersion: '2006-03-01',
      region: 'us-east-1',
      accessKeyId: credentials.keyId,
      secretAccessKey: credentials.key
    });

    transcoder = new aws.ElasticTranscoder({
      region: 'us-east-1',
      accessKeyId: credentials.keyId,
      secretAccessKey: credentials.key
    });

    lambda = new aws.Lambda({
      apiVersion: '2015-03-31',
      region: 'us-east-1',
      accessKeyId: credentials.keyId,
      secretAccessKey: credentials.key
    });

    sns = new aws.SNS({
      region: 'us-east-1',
      accessKeyId: credentials.keyId,
      secretAccessKey: credentials.key
    });
  }

  var containers =  [function () {
    return {
      Name: 'instanews-videos-in',
      Type: 'video',
      Output: 'instanews-videos',
      Params: { 
        PipelineId: '1444324496785-65xn4p',
        Input: { 
          Key: null,
          AspectRatio: 'auto', 
          Container: 'auto',
          FrameRate: 'auto',
          Resolution: 'auto',
          Interlaced: 'auto'
        },
        Outputs: [
          {
            Key: '2M',
            SegmentDuration: '5', //Seconds/segment
            Rotate: 'auto',
            //HLS 2M
            PresetId: '1351620000001-200010' 
          }, 
          /*
          { 
            Key: 'HD.mp4',
            Rotate: 'auto',
            //iPhone4S+ (1920x1080 Mp4 High-profile AAC)
            PresetId: '1351620000001-100020' 
          },
          */
          {
            Key: 'SD.mp4',
            Rotate: 'auto',
            ThumbnailPattern: '-SD-{count}',
            //iPhone1-3 (640x480 Mp4 baseline AAC)
            //PresetId: '1445198308687-fnaxk5' 
            //PresetId: '1452644707524-dm853y' 
            PresetId: '1452650735370-1grufa' 
          }] 
          //TODO webM
      }
    };
  },
  function () {
    return {
      Name: 'instanews-videos-test-in',
      Type: 'video',
      Output: 'instanews-videos-test',
      Params: { 
        PipelineId: '1452020851595-e01yyt',
        Input: { 
          Key: null,
          AspectRatio: 'auto', 
          Container: 'auto',
          FrameRate: 'auto',
          Resolution: 'auto',
          Interlaced: 'auto'
        },
        Outputs: [
          {
            Key: '2M',
            SegmentDuration: '5', //Seconds/segment
            Rotate: 'auto',
            //HLS 2M
            PresetId: '1351620000001-200010' 
          }, 
          /*
          { 
            Key: 'HD.mp4',
            Rotate: 'auto',
            //iPhone4S+ (1920x1080 Mp4 High-profile AAC)
            PresetId: '1351620000001-100020' 
          },
          */
          {
            Key: 'SD.mp4',
            Rotate: 'auto',
            ThumbnailPattern: '-SD-{count}',
            //iPhone1-3 (640x480 Mp4 baseline AAC)
            PresetId: '1452650735370-1grufa' 
            //PresetId: '1452644707524-dm853y' 
            //PresetId: '1445198308687-fnaxk5' 
          }] 
          //TODO webM
      }
    };
  },
  function () {
    return {
      Name: 'instanews-photos-in',
      Type: 'photo',
      Params: {
        FunctionName: 'imageTranscoder',
        Payload: '{}',
        InvocationType: 'Event'
      }
    };
  },
  function () {
    return {
      Name: 'instanews-photos-test-in',
      Type: 'photo',
      Params: {
        FunctionName: 'imageTranscoder',
        Payload: '{}',
        InvocationType: 'Event'
      }
    };
  }];

  var getContainer = function (name) {
    for(var i in containers) {
      var cntr = containers[i];
      if(cntr().Name === name) {
        return cntr();
      }
    }
  };

  var getTranscoderParams = function (containerName, filename) {
    var cntr = getContainer(containerName);
    var name = filename.slice(0, filename.lastIndexOf('.'));

    if(cntr) {
      if(cntr.Type === 'video') {
        cntr.Params.Input.Key = filename;
        for(var j in cntr.Params.Outputs) {
          var key = cntr.Params.Outputs[j].Key;
          cntr.Params.Outputs[j].Key = name;
          if(key.indexOf('.') !== 0) {
            cntr.Params.Outputs[j].Key += '-';
          }
          cntr.Params.Outputs[j].Key += key;

          var thumbnail = cntr.Params.Outputs[j].ThumbnailPattern;
          if(thumbnail) {
            thumbnail = name + thumbnail;
          }
          cntr.Params.Outputs[j].ThumbnailPattern = thumbnail;
        }
        console.dir(cntr.Params);
        return cntr.Params;
      } else if(cntr.Type === 'photo') {
        cntr.Params.Payload = JSON.stringify({
          name: filename,
          container: containerName
        });
        console.dir(cntr.Params);
        return cntr.Params;
      } else {
        console.log('Unknown container type!');
        console.dir(cntr);
      }
    }
  };

  var getOutputContainerName = function(input) {
    var cntr = getContainer(input);
    if(cntr) {
      return cntr.Output;
    }
  };

  var getContainerType = function (name) {
    var cntr = getContainer(name);
    if(cntr) {
      return cntr.Type;
    }
  };

  Storage.triggerTranscoding = function (containerName, file, cb) {
    var dd = Storage.app.DD('Storage','triggerTranscoding');

    if(process.env.NODE_ENV === 'staging' && containerName.indexOf('test') === -1) {
      containerName = containerName.slice(0, containerName.lastIndexOf('-in')) + '-test-in';
    }

    var params = getTranscoderParams(containerName, file);
    var type = getContainerType(containerName);

    if(params) {
      if(type === 'video') {
        if( transcoder) {
          transcoder.createJob(params, function (err, res) {
            dd.lap('Transcoder.createJob');
            if(err) {
              console.error('Failed to create transcoding job');
              console.error(err.stack);
              return cb(err);
            } 

            var id = res.Job.Id;
            var obj = {
              id: id,
              container: getOutputContainerName(containerName),
              outputs: [],
              posters: []
            };

            var outputs = res.Job.Outputs;
            for(var i in outputs) {
              var key = outputs[i].Key;
              if(outputs[i].SegmentDuration) {
                key += '.m3u8';
              }
              var poster = outputs[i].ThumbnailPattern;
              if(poster) {
                poster = poster.replace(/{count}/, '00001.png');
                obj.posters.push(poster);
              }
              obj.outputs.push(key);
            }

            console.log('Transcoding Job ' + id + ' has started!');
            cb(null, obj);
          });
        } else {
          console.warn('No transcoder established!');
          cb();
        }
      } else if(type === 'photo') {
        lambda.invoke(params, function(err, data) {
          dd.lap('Lambda.invoke');
          if (err) {
            console.error('imageTranscoding failed!');
            console.error(err.stack); // an error occurred
            cb(err);
          } else {
            console.log('imageTranscoding of ' + file + ' has started succeffully');
            console.dir(data);           // successful response
            cb();
          }
        });
      } else {
        console.warn('Unkown type of container');
        cb();
      }
    } else {
      console.warn('No transcoding params were found for ' + containerName);
      cb();
    }
  };

  Storage.transcodingComplete = function (ctx, next) {
    var dd = Storage.app.DD('Storage','transcodingComplete');
    var Subarticle = Storage.app.models.Subarticle;
    var req = ctx.req;

    var chunks = [];
    req.on('data', function(chunk) {
      chunks.push(chunk);
    });

    req.on('end', function () {
      dd.lap('Storage.transcodingCompleteRequestEnd');
      if(chunks.length > 0) {
        var job;
        try {
          job = chunks.join('');
          job = JSON.parse(job);
          //job = JSON.parse(job);
        } catch(e) {
          var err = new Error('Failed to parse the raw body');
          console.log(e);
          return next(err);
        }

        console.log('\nJob After Parse');
        console.dir(job, { colors: true });

        validator.validate(job, function(err, job) {
          dd.lap('Validator.validate');
          if(err) {
            console.error(err.stack);
            next(err);
          } else {

            switch(job.Type) {
              case 'Notification':
                var message = job.Message;

                try {
                  message = JSON.parse(message);
                  console.dir(message, { colors: true });
                } catch(e) {
                  err = new Error('Failed to parse the notification message');
                  console.log(e);
                  return next(err);
                }

                if(!message.jobId) {
                  var e = new Error('No JobId was given in the notification message');
                  e.status = 400;
                  console.log(e);
                  return next(e);
                }

                Subarticle.clearPending(message, function (err) {
                  dd.lap('Subarticle.clearPending');
                  dd.elapsed();
                  console.log('Transcoding Job ' + message.jobId + ' has finished!');
                  if(err) {
                    console.error(err);
                  }
                  next(err);
                });

                break;
              case 'SubscriptionConfirmation':
                if(sns) {
                  sns.confirmSubscription({
                    Token: job.Token,
                    TopicArn: job.TopicArn
                  }, function(err, data) {
                    dd.lap('SNS.confirmSubscription');
                    dd.elapsed();
                    if( err) {
                      console.error(err.stack);
                      next(err);
                    } else {
                      console.dir(data, {colors: true});
                      next();
                    }
                  });
                } else {
                  console.warn('No SNS connection established');
                  next();
                }
                break;
              default:
                var er = new Error('Unknown message type ' + job.Type);
                er.status = 403;
                next(er);
                break;
            }
          }
        });
      } else {
        console.log('No data passed into transcodingComplete');
        next();
      }
    });
  };

  if(s3 && s3.getObject) {
    Storage.getObject = s3.getObject.bind(s3);
  }

  Storage.updateCacheControl = function(container, keys, cb) {
    var dd = Storage.app.DD('Storage','udpateCacheControl');
    if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      cb();
    } else {
      if(container && keys.length) {
        if(process.env.NODE_ENV !== 'production' && container.indexOf('test') === -1) {
          container += '-test';
        }

        var setCacheControl = function(key, next) {
          s3.headObject({
            Bucket: container,
            Key: key
          }, function(err, data) {
            dd.elapsed('S3.headObject');
            if(err) {
              console.error('Failed to get object metadata');
              console.error(key);
              console.error(err.stack);
              next(err);
            } else {
              var meta = data.metadata;
              s3.copyObject({
                Bucket: container,
                CopySource: container + '/' + key,
                MetadataDirective: 'REPLACE',
                Metadata: meta,
                CacheControl: 'no-transform,public,max-age=86400',
                Key: key 
              }, function(err) {
                dd.elapsed('S3.copyObject');
                if(err) {
                  console.error('Failed to update cache control');
                  console.error(key);
                  console.error(err.stack);
                }
                next(err);
              });
            }
          });
        };

        var funcs = [];
        keys.forEach(function(key) {
          funcs.push(setCacheControl.bind(this, key));
        });

        async.parallel(funcs, function(err) {
          cb(err);
        });
      } else {
        var e = new Error('A container and keys are required to update cache-control');
        e.status = 403;
        console.warn(e.message);
        cb(e);
      }
    }
  };

  Storage.archive = function(instance, cb) {
    var dd = Storage.app.DD('Storage','archive');
    if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      cb();
    } else {
      if(instance.modelName) {
        var container = 'instanews-' + instance.modelName + 's';
        if(process.env.NODE_ENV !== 'production') {
          container += '-test';
        }
        container += '-delete';

        s3.putObject({
          Bucket: container,
          Body: JSON.stringify(instance),
          Key: instance.id + '.json'
        }, function(err) {
          dd.lap('S3.putObject');
          if(err) {
            console.error('Failed to archive the given instance');
            console.error(instance);
            console.error(err.stack);
          }
          cb(err);
        });
      } else {
        var e = new Error('There was no modelName on the given instance. Archiving cancelled');
        e.status = 403;
        console.warn(e.message);
        cb(e);
      }
    }
  };

  Storage.destroy = function(container, name, next) {
    var dd = Storage.app.DD('Storage','destroy');
    var params = {
      Bucket: container + '-delete',
      CopySource: container + '/' + name,
      Key: name
    };

    s3.copyObject(params, function(err, data) {
      dd.lap('S3.copyObject');
      if( err) {
        console.error('Failed to copy the given instance');
        console.log(params);
        console.error(err.stack);
        next(err);
      } else {
        params = { 
          Bucket: container,
          Key: name
        };

        s3.deleteObject(params, function (err, data) {
          dd.lap('S3.deleteObject');
          if(err) {
            console.error('Failed to delete the given instance');
            console.log(params);
            console.error(err.stack);
            next(err);
          } else {
            next();
          }
        });
      }
    });
  };

  Storage.getUploadKey = function (container, fileName, type, cb) {
    var dd = Storage.app.DD('Storage','getUploadKey');

    if(process.env.NODE_ENV !== 'production' && container.indexOf('test') === -1) {
      if(process.env.NODE_ENV === 'staging') {
        container = container.slice(0, container.lastIndexOf('-in')) + '-test-in';
      } else {
        container += '-test';
      }
    }

    if(!process.env.NODE_ENV  || process.env.NODE_ENV === 'development') {
      cb(null, {
        url: 'http://localhost:3000/api/storages/' + container + '/upload/',
        container: container,
        params: {}
      });
    } else {
      var policy = {
        expiration: new Date(new Date().getTime() + 1000*60*10), //Expires in 10 minutes
        conditions: [
          { bucket: container },
          { key: fileName },
          { acl: 'public-read' },
          { 'Content-Type': type }]
      };

      if(container.indexOf('video') > -1) {
        policy.conditions.push(['content-length-range', 0, 500*1024*1024]); //500Mb video size limit
      } else if(container.indexOf('photo') > -1) {
        policy.conditions.push(['content-length-range', 0, 50*1024*1024]); //50Mb photo size limit
      } else {
        var e = new Error('Unknown container!'); 
        e.status = 404;
        console.error(container);
        console.error(e);
        return cb(e);
      }

      var policyBase64 = new Buffer(JSON.stringify(policy), 'utf8').toString('base64');
      var signature = crypto.createHmac('sha1', credentials.key).update(policyBase64).digest('base64');

      cb(null, {
        url: 'https://' + container + '.s3.amazonaws.com/',
        container: container,
        params: {
          'key': fileName,
          'AWSAccessKeyId': credentials.keyId,
          'acl': 'public-read',
          'policy': policyBase64,
          'signature': signature,
          'Content-Type': type
        }
      });
    }
  };

  Storage.remoteMethod(
    'transcodingComplete',
    {
      description: 'Handles job completion notifications passed from the transcoder',
      accepts: [{
        arg: 'ctx', type: 'object', 'http': { source: 'context'}
      }]
    }
  );

  Storage.remoteMethod(
    'getUploadKey',
    {
      description: 'Retrieves an upload key for storage',
      accepts: [{
        arg: 'container', type: 'string'
      },
      {
        arg: 'fileName', type: 'string'
      },
      {
        arg: 'type', type: 'string'
      }],
      returns: { arg: 'data', type: 'object'},
      http: { path: '/uploadKey', verb: 'get'}
    }
  );
};
