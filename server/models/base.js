var common = require('./common');

module.exports = function(Base) {
  common.initBase(Base);

  var getDeferredUpdateKey = function(id, type) {
    var key = 'u:' + type.slice(0,2) + ':' + id;
    console.log(key);
    return key;
  };

  var getDeferredUpdateId = function(key) {
    var res = key.slice(key.lastIndexOf(':') + 1, key.length);
    console.log(res);
    return res;
  };

  var getDeferredUpdateType = function(key) {
    var shortType = key.split(':')[1];
    console.log(shortType);
    var res;
    switch(shortType) {
      case 'ar':
        res = 'article';
        break;
      case 'co':
        res = 'comment';
        break;
      case 'su':
        res = 'subarticle';
        break;
      default:
        console.error('Unknown deferred update type!');
        break;
    }
    console.log(res);
    return res;
  };

  var createOrUpdateDeferredUpdate = function (id, type, data, cb) {
    if(data.$inc || data.$set) {
      var key = getDeferredUpdateKey(id, type);
      var redis = Base.app.redisClient;
      var red = redis.multi().exists(key);
      if(data.$inc) {
        for(var i in data.$inc) {
          console.log('data.$inc.' + i + ' = ' + data.$inc[i]);
          red = red.hincrby(key, i, data.$inc[i]);
        }
      }
      if(data.$set) {
        var args = [];
        for(var j in data.$set) {
          console.log('data.$set.' + j + ' = ' + data.$set[j]);
          args.push(j);
          args.push(data.$set[j]);
        }

        if(args.length === 2) {
          red = red.hset(key, args);
        } else {
          red = red.hmset(key, args);
        }
      }

      red.exec(function(err, res) {
        if(err) {
          console.error('Failed to perform redis transaction!');
          console.error(err.stack);
        }

        cb(null, !res[0][1]);
      });
    } else {
      var err = new Error('Invalid update data given!');
      err.status = 400;
      cb(err);
    }
  };

  Base.processUpdate = function(key, next) {
    var redis = Base.app.redisClient;
    console.log('Processing: ' + key);
    redis.multi().hgetall(key).del(key).exec(function(err, res) {
      if(err) {
        console.error('Failed to complete the update transaction!');
        console.error(err.stack);
        return next(err);
      }
      var data = res[0][1];
      console.log(data);

      // createSubarticleCount and createCommentCount are taken care of with a DB read
      var incrementers = ['viewCount', 'getSubarticlesCount', 'getCommentsCount', 'clickCount']; 
      var shouldNotBeDeferred = ['upVoteCount', 'createCommentCount', 'downVoteCount'];

      var notSubarticleRating = -1, notCommentRating = -1;
      var incs = {};

      for(var i = 0; i < data.length - 1; i += 2) {
        try {
          if(shouldNotBeDeferred.indexOf(data[i]) > -1) {
            console.warn('Should not be deferred: ' + data[i] + data[i+1]);
            console.warn('Not implementing update of invalid values');
          } else if(incrementers.indexOf(data[i]) > -1) {
            console.log('Incrementing ' + data[i] + data[i+1]);
            incs[data[i]] = JSON.parse(data[i+1]);
          } else if(data[i] === 'comments') {
            if(JSON.parse(data[i+1])) {
              console.log('Recalculating comment contribution!');
              //TODO Read all comments from the database for this model
            }
          } else if(data[i] === 'subarticles') {
            if(JSON.parse(data[i+1])) {
              console.log('Recalculating subarticle contribution!');
              //TODO Read all subarticles from the database for this model
            }
           }
        } catch(e) {
          console.error(e.stack);
        }
      }

      console.log(incs);

      Base.app.models.Stat.updateRating({ 
        id: getDeferredUpdateId(key)
      },
      getDeferredUpdateType(key),
      function(instance) {
        for(var i in incs) {
          instance[i] += incs[i];
        }
        if(notSubarticleRating >= 0) {
          instance.notSubarticleRating = notSubarticleRating;
        }
        if(notCommentRating >= 0) {
          instance.notCommentRating = notCommentRating;
        }
        return instance;
      }, next);
    });
  };

  Base.deferUpdate = function (id, type, data, next) {
    console.log('Creating an update job for ' + type + ': ' + id);

    createOrUpdateDeferredUpdate(id, type, data, function(err, newInstance) {
      if(err) {
        console.error(err.stack);
        return next(err);
      }

      if(newInstance) {
        Base.app.jobs.create('updateBase', {
          key: getDeferredUpdateKey(id, type)
        }).delay(30000)
        //.attempts(5)
        .removeOnComplete(true)
        .save();
      }

      next();
    });
  };
};
