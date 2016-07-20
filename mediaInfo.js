'use strict';

var cred = require('./server/conf/credentials');

var mongo = cred.get('mongo');
var mongoCA = cred.get('mongoCA');

var mongodb = '';
if( mongo.username && mongo.password) {
  mongodb += mongo.username +
  ':' + mongo.password;
}

mongodb  += mongo.url;

var options = {
  connectTimeoutMS: 30000
};

if(mongo.replicaSet) {
  options.replicaSet = mongo.replicaSet;
}

if(mongo.ssl && mongoCA) {
  options = {
    ssl: true,
    sslValidate: true,
    sslCA: [mongoCA],
  };
}

const async = require('async');
const exec = require('child_process').exec;
const db = require('monk')(mongodb + 'articles', options);
const articles = db.get('article');
const subarticles = db.get('subarticle');

function convertDuration(duration) {
  return duration.split(' ').map(time => {
    var unit = time.match(/[a-z]*$/);
    var time = time.match(/^[0-9]*/);
    try {
      var value = Number(time[0].slice(time[0].length -1));
      switch(unit[0]) {
        case 'h':
          value *= 3600;
          break;
        case 'hr':
          value *= 3600;
          break;
        case 'mn':
          value *= 60;
          break;
        case 's':
          break;
        case 'ms':
          value = 0;
          break;
        default:
          throw 'Unknown time value ' + unit[0];
          break;
      }

      return value;
    } catch(e) {
      console.error(e);
      return NaN;
    }
  }).reduce((prev, curr) => {
    return prev + curr;
  });
}

function convertDimension(dimension) {
  var value = dimension.replace(/\s+/g, '').match(/^[0-9]*/)[0];
  try {
    return Number(value);
  } catch(e) {
    console.error(e);
    return NaN;
  }
}

function processItems(items, cb) {
  function *processGenerator() {
    var errors = [];
    for(var item of items) {
      yield processItem(item, function(err) {
        if(err) {
          errors.push(err);
        }
        Processor.next();
      });
    }

    cb(errors);
  }
  var Processor = processGenerator();
  Processor.next();
}

function processItem(model, cb) {
  console.log('processing: ' + model._id);

  var funcs = [];
  var sourceMetadata = [];
  var getMetadata = function(src, cb) {
    var cmd = 'mediainfo https://s3.amazonaws.com/instanews-videos';
    switch(process.env.NODE_ENV) {
      case 'staging':
        cmd += '-test/';
        break;
      case 'production':
        cmd += '/';
        break;
      default:
        cmd = 'mediainfo ./storage/instanews-videos/';
        break;
    }

    cmd += src;

    //console.log(cmd);
    exec(cmd, function(err, res, stderr) {
      if(err) {
        return cb(err);
      }
      if(stderr) {
        console.log(stderr);
      }

      res = res.split('\n');
      var metadata = {};
      var type = {};
      for(var line of res) {
        if(line !== '') {
          var pair = line.split(' : ');
          if(pair.length === 2) {
            metadata[type][pair[0].toLowerCase().trim()] = pair[1].trim();
          } else {
            type = pair[0].toLowerCase().trim();
            metadata[type] = {};
          }
        }
      }

      if(metadata.video) {
        var width = convertDimension(metadata.video.width);
        var height = convertDimension(metadata.video.height);

        if(isNaN(width) || isNaN(height)) {
          return cb(new Error('Failed to convert data for ' + src));
        }

        sourceMetadata.push({
          name: src,
          width: width,
          height: height
        });
        cb();
      } else {
        cb(new Error('Failed to get video metadata for ' + src));
      }
    });
  };

  for(var src of model._file.sources) {
    funcs.push(getMetadata.bind(getMetadata, src));
  }

  async.parallel(funcs, function(err, res) {
    if(err) {
      return cb(err);
    }

    subarticles.update({ _id: model._id },{ 
      $set: {
        '_file.sourceMetadata': sourceMetadata
      }
    }).then(function() {
      //console.log('Model: ' + model.modelName + '\tRating: ' + rating);
      articles.findOne({ _id: model.parentId }).then((article) => {
        if(article.topSubarticle && article.topSubarticle._id === model._id) {
          articles.update({ _id: model.parentId },{ 
            $set: {
              'topSubarticle._file.sourceMetadata': sourceMetadata
            }
          }).then(cb);
        } else { 
          cb(err);
        }
      });
    });
  });
}

function test(cb) {
  console.log('Testing...');
  var res = convertDuration('3hr 4mn 5s 657ms');
  if(res !== 11045) {
    console.log(res);
    return cb(new Error('convertDuration bug!'));
  }
  res = convertDimension('1 024 pixels');
  if(res !== 1024) {
    console.log(res);
    return cb(new Error('convertDimension bug!'));
  }

  console.log('Testing Complete');
  cb();
}

test(err => {
  if(err) {
    console.error(err);
    process.exit(1);
  } else {
    subarticles.find({
      $and: [{
        '_file.type': {
          $regex: 'video' 
        }
      },
      {
        '_file.sourceMetadata': {
          $exists: false
        }
      }]
      /*
      '_file.type': {
        $regex: 'video' 
      }
      */
    }).then((subs) => {
      console.log('Processing ' + subs.length + ' subarticles');
      processItems(subs, (errs) => {
        if(errs.length) {
          console.log(errs);
          process.exit(1);
        } else {
          console.log('Successfully processed all videos!');
          process.exit(0);
        }
      });
    });
  }
});
