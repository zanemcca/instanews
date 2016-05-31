
var ONE_DAY = 24*60*60*1000; // 1 Day in millisecs
var ONE_WEEK = 7*ONE_DAY; // 1 Week in millisecs
var ONE_MONTH = 30*ONE_DAY; // 1 Month in millisecs

var PRELOAD_LIMIT = 1; //WARNING: Changing this could break the ranking algorithm

var LIMIT = 300; //Load limit

/* jshint camelcase: false */

var loopback = require('loopback');
module.exports = function(app) {

  var Article = app.models.Article;
  var Base = app.models.base;
  var View = app.models.view;
  var Subarticle = app.models.Subarticle;
  var Storage = app.models.Storage;
  var Stat = app.models.Stat;

  var debug = app.debug('hooks:article');

  Article.afterRemote('prototype.__get__comments', function(ctx, instance, next){
    var dd = app.DD('Article','afterGetComments');
    ctx.options = {
      clickType: 'getComments'
    };
    debug('afterRemote prototype.__get__comments', ctx, instance, next);

    Base.createClickAfterRemote(ctx, function (err) {
      dd.lap('Base.createClickAfterRemote');
      /* istanbul ignore next */
      if(err) {
        console.error(err.stack);
      }
    });

    next();
  });

  Article.afterRemote('prototype.__get__subarticles', function(ctx, inst, next){
    var dd = app.DD('Article','afterGetSubarticles');
    ctx.options = {
      clickType: 'getSubarticles'
    };
    debug('afterRemote prototype.__get__subarticles', ctx, inst, next);

    // Only requests for more than one subarticle count as a click
    /* istanbul ignore else */
    if(ctx.req.query && ctx.req.query.filter) {
      var filter = JSON.parse(ctx.req.query.filter);
      if(filter.limit && filter.limit <= PRELOAD_LIMIT) {
        return next();
      }
    }

    Base.createClickAfterRemote(ctx, function (err) {
      dd.lap('Base.createClickAfterRemote');
      /* istanbul ignore next */
      if(err) {
        console.error(err.stack);
      }
    });

    next();
  });

  Article.observe('before save', function(ctx, next) {
    debug('observe before save', ctx);
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst) {
      //Workaround for yet another shitty bug by the ever useless loopback https://github.com/strongloop/loopback-connector-mongodb/issues/248
      if(inst.$set && inst.$set.loc) {
        delete inst.$set.loc;
      }
    }

    next();
  });

  Article.observe('after save', function(ctx, next) {
    var dd = app.DD('Article','afterSave');
    debug('observe after save', ctx);
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      View.create({
        username: inst.username,
        viewableType: 'article',
        viewableId: inst.id
      }, function(err, res) {
        dd.lap('View.create');
        /* istanbul ignore else */
        if(err) {
          console.error(
            'Error: Failed to create a view for article creation');
        }
        next(err);
      });
    }
    else {
      if(!inst) {
        console.warn('Warning: Instance is not valid for article after save');
      }
      next();
    }
  });

  Article.observe('before delete', function(ctx, next) {
    var dd = app.DD('Article','beforeDelete');
    debug('before delete', ctx, next);
    Article.find({ where: ctx.where }, function (err, res) {
      dd.lap('Article.find');
      if(err) {
        console.error(err.stack);
        next(err);
      } else if(res.length > 0) {
        res.forEach(function(inst) {
          Storage.archive(inst, function(err) {
            dd.elapsed('Storage.archive');
            var error;
            if(err) {
              console.error(err.stack);
              error = error || err;
            } 

            inst.comments.destroyAll(function (err, res) {
              dd.elapsed('Article.comments.destroyAll');
              if(err) {
                console.error(err.stack);
                error = error || err;
              }

              inst.subarticles.destroyAll(function (err, res) {
                dd.elapsed('Article.subarticles.destroyAll');
                if(err) {
                  console.error(err.stack);
                  error = error || err;
                }
                next(error);
              });
            });
          });
        });
      } else {
        next();
      }
    });
  });

  Article.beforeRemote('find', function(ctx, unused, next){
    debug('beforeRemote.find', ctx, next);

    var filter = {};
    if(ctx.args.filter) { 
      filter = JSON.parse(ctx.args.filter);
    }

    filter.where = filter.where || {};
    filter.where.id = filter.where.id || { gt: app.utils.objectIdWithTimestamp(Date.now() - 2 * ONE_WEEK) };

    var loc = filter.where.loc || filter.where.location;
    if(loc) {
      if(loc.geoWithin && loc.geoWithin.$box) {
        var box = loc.geoWithin.$box;
        var geom;
        if(filter.where.loc) {
          geom = Article.generateBoxGeometry(box[0],box[1]);
          filter.where.loc = {
            geoWithin: {
              $geometry: geom
            }
          };
        } else {
          geom = Article.generateBoxGeometry([box[0][1], box[0][0]], [box[1][1], box[1][0]]);
          filter.where.loc = {
            geoWithin: {
              $geometry: geom
            }
          };
          delete filter.where.location;
        }
      }
    }

    if( !filter.limit || filter.limit > LIMIT) {
      filter.limit = LIMIT;
    }

    ctx.args.filter = JSON.stringify(filter);

    next();
  });

  Article.beforeRemote('create', function(ctx, unused, next){
    debug('beforeRemote.create', ctx, next);

    var inst = ctx.args.data;
    if(inst) {
      inst.pending = true;

      // Loopback added support for geoJSON 2dsphere indices
      // So we need to convert any incoming articles from geoJSON to geoPoint
      if(inst.loc) {
        if(inst.loc.coordinates) {
          inst.loc = {
            lng: inst.loc.coordinates[0],
            lat: inst.loc.coordinates[1]
          };
        }

        //TODO Remove this once all v0.5.0 devices are gone
        // location is stored in 2d index and also the lat and lng are mixed up even though they are labeled correctly
        // so it is totally unreliable and only maintained for legacy reasons
        if(!inst.location) {
          // We need to maintain the legacy location until v0.5.0 frontend is expired
          inst.location = {
            lat: inst.loc.lat,
            lng: inst.loc.lng
          };
        }
      } else { //TODO Remove this once all v0.5.0 devices are gone
        if(inst.location) {
          inst.loc = {
            lng: inst.location.lng,
            lat: inst.location.lat
          };
        }
      }
    }

    next();
  });


  //TODO Configure the client to not care about geoJSON vs geoPoint and then deprecate this
  Article.observe('loaded', function(ctx, next){
    debug('observe.loaded', ctx, next);
    var inst = ctx.result || ctx.instance || ctx.data;

    //Loopback hijacked $near query but they also added support for 2DSphere indices
    //This workaround keeps the data consitently in geoJSON format on the frontend
    if(inst) {
      if(Array.isArray(ctx.result)) {
        for(var i in inst) {
          if(inst[i].loc) {
            //Unfortunately loopback does some dumb ass validation on the loc so it cannot be replaced
            //but we can add parameters to it.
            inst[i].loc.type = 'Point';
            inst[i].loc.coordinates = [ inst[i].loc.lng, inst[i].loc.lat ];
          } else {
            console.warn('Article found without a location: ' + inst[i].id);
          }
        }
      } else {
        if(inst.loc) {
          inst.loc.type = 'Point';
          inst.loc.coordinates = [ inst.loc.lng, inst.loc.lat ];
        } else {
          console.warn('Article found without a location: ' + inst.id);
        }
      }
    }
    next();
  });

  /*
   * Unused due to deferred updates
  Article.triggerRating = function(where, modify, cb) {
    var timer = app.Timer('Article.triggerRating');
    debug('triggerRating', where, modify);
    if(where && where.id) {
      //Update the article
      Stat.updateRating(where, Article.modelName, modify, function(err, res) {
        timer.elapsed();
        if(err) {
          console.warn('Warning: Failed to update an article');
          return cb(err);
        }
        cb(null, res);
      });
    } else {
      var error = new Error(
        'Invalid filter for article.triggerRating: ' + where);
      error.status = 400;
      console.error(error.stack);
      cb(error);
    }
  };
  */
};
