
var common = require('./common');
var cred = require('../conf/credentials');
var aws = require('aws-sdk');
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
  lambda;

  var credentials = cred.get('aws');
  if(credentials) {
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

  var containers = [{
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
        {
          Key: 'HD.mp4',
          Rotate: 'auto',
          //iPhone4S+ (1920x1080 Mp4 High-profile AAC)
          PresetId: '1351620000001-100020' 
        },
        {
          Key: 'SD.mp4',
          Rotate: 'auto',
          ThumbnailPattern: '-SD-{count}',
          //iPhone1-3 (640x480 Mp4 baseline AAC)
          PresetId: '1445198308687-fnaxk5' 
        }]
        //TODO webM
    }
  },
  {
    Name: 'instanews-photos-in',
    Type: 'photo',
    Params: {
      FunctionName: 'imageTranscoder',
      Payload: '{}',
      InvocationType: 'Event'
    }
  }];

  var getContainer = function (name) {
    for(var i in containers) {
      var cntr = containers[i];
      if(cntr.Name === name) {
        return cntr;
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
    var params = getTranscoderParams(containerName, file);
    var type = getContainerType(containerName);

    if(params) {
      if(type === 'video') {
        if( transcoder) {
          transcoder.createJob(params, function (err, res) {
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

  //Recieves the transcoding message as the input
  Storage.clearPending = function (message, next) {
    var Subarticle = Storage.app.models.Subarticle;
    var Article = Storage.app.models.Article;

    Subarticle.findOne({
      where: {
        pending: message.jobId
      }
    }, function (err, res) {
      if(err) {
        console.log('Failed to find the subarticle');
        return next(err);
      }

      if(res) {

        var query = {
          $unset: {
            pending: ''
          }
        };

        console.log(res);
        if(message.sources) {
          query.$set = {
            '_file.sources': message.sources 
          };
        }

        var parentId = res.parentId;

        res.updateAttributes(query, function (err, res) {
          if(err) {
            return next(err);
          }
          Article.clearPending(parentId, next);
        });
      } else {
        console.log('No Subarticle found with pending: ' + message.jobId);
        return next();
      }
    });
  };

  Storage.transcodingComplete = function (ctx, next) {
    var req = ctx.req;

    var chunks = [];
    req.on('data', function(chunk) {
      chunks.push(chunk);
    });

    req.on('end', function () {

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

              Storage.clearPending(message, function (err) {
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
                  if( err) {
                    console.error(err.stack);
                    next(err);
                  } else {
                    // TODO Set pending flag
                    //TODO Clear pending flag from subarticle and article
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

  Storage.remoteMethod(
    'transcodingComplete',
    {
      description: 'Handles job completion notifications passed from the transcoder',
      accepts: [{
        arg: 'ctx', type: 'object', 'http': { source: 'context'}
      }]
    }
  );
};
