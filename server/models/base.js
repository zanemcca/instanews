var common = require('./common');

module.exports = function(Base) {
  common.initBase(Base);

  var getDeferredUpdateKey = function(id, type) {
    var key = 'u:' + type.slice(0,3) + ':' + id;
    return key;
  };

  var getDeferredUpdateId = function(key) {
    var res = key.slice(key.lastIndexOf(':') + 1, key.length);
    return res;
  };

  var getDeferredUpdateType = function(key) {
    var shortType = key.split(':')[1];
    var res;
    switch(shortType) {
      case 'art':
        res = 'article';
        break;
      case 'com':
        res = 'comment';
        break;
      case 'sub':
        res = 'subarticle';
        break;
      default:
        console.error('Unknown deferred update type!');
        break;
    }
    return res;
  };

  var createOrUpdateDeferredUpdate = function (id, type, data, cb) {
    if(data.$inc || data.$set || data.updateRating || data.comment || data.subarticle) {
      var key = getDeferredUpdateKey(id, type);
      var redis = Base.app.redisClient;
      var red = redis.multi().exists(key);
      if(data.comment) {
        red = red.hset(key, 'comment', true);
      }
      if(data.subarticle) {
        red = red.hset(key, 'subarticle', true);
      }
      if(data.updateRating) {
        red = red.hset(key, 'updateRating', true);
      }
      if(data.$inc) {
        for(var i in data.$inc) {
          //console.log('data.$inc.' + i + ' = ' + data.$inc[i]);
          red = red.hincrby(key, i, data.$inc[i]);
        }
      }
      if(data.$set) {
        var args = [];
        for(var j in data.$set) {
          //console.log('data.$set.' + j + ' = ' + data.$set[j]);
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
    var debug = Base.app.debug('models:base');
    var dd = Base.app.DD('Base','processUpdate');
    debug('processUpdate', key);

    var redis = Base.app.redisClient;
    redis.multi().hgetall(key).del(key).exec(function(err, res) {
      dd.lap('Redis.getAndDelete');
      if(err) {
        console.error('Failed to complete the update transaction!');
        console.error(err.stack);
        return next(err);
      }
      var data = res[0][1];
      //console.log(data);

      var id = getDeferredUpdateId(key);
      var type = getDeferredUpdateType(key);

      // createSubarticleCount and createCommentCount are taken care of with a DB read
      var incrementers = ['viewCount', 'getSubarticlesCount', 'getCommentsCount', 'clickCount']; 
      var shouldNotBeDeferred = ['upVoteCount', 'createCommentCount', 'downVoteCount'];

      var notSubarticleRating = -1, notCommentRating = -1;
      var commentCount, subarticleCount;
      var topSubarticle;
      var incs = {};

      var addSubarticle, addComment;
      var addCommentRating = function(cb) {
        Base.app.models.Comment.find({
          where: {
            commentableId: id,
            commentableType: type 
          }
        }, function(err, res) {
          if(err) {
            console.error('Failed to find subarticles for rank updating');
            console.error(err);
            //TODO Don't worry about it. Just create a new deferred update
            return cb(err);
          }

          notCommentRating = 1;
          commentCount = res.length;
          for(var i in res) {
            notCommentRating *= (1 - res[i].rating);
          }

          dd.lap('Comment.find');
          cb();
        });
      };

      var addSubarticleRating = function (cb) {
        Base.app.models.Subarticle.find({
          where: {
            parentId: id
          },
          order: 'rating DESC'
        }, function(err, res) {
          if(err) {
            console.error('Failed to find subarticles for rank updating');
            console.error(err);
            //TODO Don't worry about it. Just create a new deferred update
            return cb(err);
          }

          notSubarticleRating = 1;
          subarticleCount = res.length;
          if(res.length) {
            topSubarticle = res[0].toObject();
            for(var i in res) {
              notSubarticleRating *= (1 - res[i].rating);
            }
          }

          dd.lap('Subarticle.find');
          cb();
         });
      };

      for(var i = 0; i < data.length - 1; i += 2) {
        try {
          //console.log(data[i] + ': ' + data[i +1]);
          if(shouldNotBeDeferred.indexOf(data[i]) > -1) {
            console.warn('Should not be deferred: ' + data[i] + data[i+1]);
            console.warn('Not implementing update of invalid values');
          } else if(incrementers.indexOf(data[i]) > -1) {
            //console.log('Incrementing ' + data[i] + ': ' + data[i+1]);
            incs[data[i]] = JSON.parse(data[i+1]);
          } else if(data[i] === 'comment') {
            if(JSON.parse(data[i+1])) {
              //console.log('Recalculating comment contribution!');
              addComment = true;
            }
          } else if(data[i] === 'subarticle') {
            if(JSON.parse(data[i+1])) {
              //console.log('Recalculating subarticle contribution!');
              addSubarticle = true;
            }
           }
        } catch(e) {
          console.error(e.stack);
        }
      }

      if(!addComment) {
        addCommentRating = function (cb) {
          cb();
        };
      }
      if(!addSubarticle) {
        addSubarticleRating = function (cb) {
          cb();
        };
      }

      addCommentRating(function(err) {
        if(err) {
          console.error('Failed to addCommentRating');
          return next(err);
        }
        addSubarticleRating(function(err) {
          if(err) {
            console.error('Failed to addSubarticleRating');
            return next(err);
          }

          Base.app.models.Stat.updateRating({ 
            id: getDeferredUpdateId(key)
          },
          getDeferredUpdateType(key),
          function(instance) {
            for(var i in incs) {
              //console.log('Incrementing ' + i + ': ' + incs[i]);
              instance[i] += incs[i];
            }
            if(notSubarticleRating >= 0) {
              //console.log('Updating notSubarticleRating: ' + notSubarticleRating);
              //console.log('Updating createSubarticleCount: ' + subarticleCount);
              //console.log('Updating topSub: ');
              //console.log(topSubarticle);
              instance.createSubarticleCount = subarticleCount;
              instance.notSubarticleRating = notSubarticleRating;
              instance.topSubarticle = topSubarticle;
            }
            if(notCommentRating >= 0) {
              //console.log('Updating notCommentRating: ' + notCommentRating);
              //console.log('Updating createCommentCount: ' + commentCount);
              instance.createCommentCount = commentCount;
              instance.notCommentRating = notCommentRating;
            }

            return instance;
          }, function(err) {
            dd.lap('Stat.updateRating');
            if(err) {
              console.error('Failed to update the rating!'); 
              console.error(err);
              //TODO Create a new deferred update with all of the missed information to retry
              return next(err);
            }
            next();
          });
        });
      });
    });
  };

  Base.deferUpdate = function (id, type, data, next) {
    var debug = Base.app.debug('models:base');
    var dd = Base.app.DD('Base', 'deferUpdate');
    debug('deferUpdate', id, type, data);

    createOrUpdateDeferredUpdate(id, type, data, function(err, newInstance) {
      dd.lap('Redis.createOrUpdate');
      if(err) {
        console.error(err.stack);
        return next(err);
      }

      if(newInstance) {
        Base.app.jobs.create('deferredUpdate', {
          key: getDeferredUpdateKey(id, type)
        }).delay(30000)
        .on('promotion', function () {
          dd.increment('Jobs.promotion');
        })
        .on('complete', function () {
          dd.increment('Jobs.complete');
        })
        .on('failed', function () {
          dd.increment('Jobs.failed');
        })
        .on('failed attempt', function () {
          dd.increment('Jobs.failedAttempt');
        })
        .attempts(5)
        .removeOnComplete(true)
        .save();
      }

      next();
    });
  };
};
