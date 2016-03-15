var common = require('./common');

module.exports = function(Base) {
  common.initBase(Base);

  var getDeferredUpdateKey = function(id, type) {
    var key = 'u:' + type.slice(0,2) + ':' + id;
    console.log(key);
    return key;
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
      var data = res[0];
      console.log(data);
      //TODO Perform updating here
      next();
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
