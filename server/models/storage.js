
var common = require('./common');
var cred = require('../conf/credentials');
var aws = require('aws-sdk');

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

  var transcoder;
  var credentials = cred.get('aws');
  if(credentials) {
    transcoder = new aws.ElasticTranscoder({
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
    Name: 'instanews.videos.in',
    Params: {
      PipelineId: '1444324496785-65xn4p',
      Input: {
        Key: null 
        // auto for everything else
      },
      Outputs: [{
        Key: 'hd',
        //iPhone4S+ (1920x1080 Mp4 High-profile AAC)
        PresetId: '1351620000001-100020' 
      },
      {
        Key: 'sd',
        //iPhone1-3 (640x480 Mp4 baseline AAC
        PresetId: '1351620000001-100040' 
      }]
      //TODO HLS, webM
    }
  }];

  var getTranscoderParams = function (name, filename) {
    for(var i in containers) {
      var cntr = containers[i];
      if(cntr.Name === name) {
        cntr.Params.Input.Key = filename;
        for(var j in cntr.Params.Outputs) {
          cntr.Params.Outputs[j].Key += '-' + filename;
        }
        return cntr.Params;
      }
    }
  };

  common.disableRemotes(Storage, staticDisable,true);

  Storage.triggerTranscoding = function (containerName, file, cb) {
    var params = getTranscoderParams(containerName, file);

    var name = file.slice(0, file.lastIndexOf('.'));

    if(params) {
      if(transcoder) {
        transcoder.createJob(params, function (err, res) {
          console.log(res);
          cb(err, res);
        });
      } else {
        console.warn('No transcoder established!');
        cb();
      }
    } else {
      console.warn('No transcoding params were found for ' + containerName);
      cb();
    }
  };

  Storage.transcodingComplete = function (ctx, job, next) {
    console.dir(job, { colors: true });
    switch(job.Type) {
      case 'Notification':
        //TODO Handle the notification
        next();
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
              console.dir(data, {color: true});
              next();
            }
          });
        } else {
          console.warn('No SNS connection established');
          next();
        }
        break;
      default:
        var e = new Error('Unknown message type ' + job.Type);
        e.status = 403;
        next(e);
        break;
    }
  };

  Storage.remoteMethod(
    'transcodingComplete',
    {
      description: 'Handles job completion notifications passed from the transcoder',
      accepts: [{
        arg: 'ctx', type: 'object', 'http': { source: 'context'}
      },
      {
        arg: 'job', type: 'object', required: true
      }]
    }
  );
};
