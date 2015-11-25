
/* jshint camelcase: false */
var LIMIT = 300;


var ONE_DAY = 24*60*60*1000; // 1 Day in millisecs
var ONE_WEEK = 7*ONE_DAY; // 1 Week in millisecs
var ONE_MONTH = 30*ONE_DAY; // 1 Month in millisecs

module.exports = function(app) {

  var loopback = require('loopback');
  var Base = app.models.base;
  var Article = app.models.article;
  var Subarticle = app.models.subarticle;
  var Comment = app.models.comment;
  var Stat = app.models.Stat;
  var Click = app.models.Click;

  var debug = app.debug('hooks:base');

  Base.createClickAfterRemote = function(ctx, next){
    debug('createClickAfterRemote', ctx);
    if(ctx &&
       ctx.req &&
         ctx.req.remotingContext &&
           ctx.req.remotingContext.instance &&
             ctx.req.remotingContext.instance.id
      ){
        var context = loopback.getCurrentContext();
        if(context) {
          var token = context.get('accessToken');
          if(token) {
            var click = {
              username: token.userId,
              type: ctx.options.clickType,
              clickableType: ctx.req.remotingContext.instance.modelName,
              clickableId: ctx.req.remotingContext.instance.id
            };
            Click.create(click, function(err, res) {
              if(err) {
                console.error(err.stack);
              }
              next(err);
            });
          }
          else {
            next();
          }
        }
        else {
          console.warn('Warning: No context object was found!');
          next();
        }
      }
      else {
        var error = new Error('Invalid context for Base.createClickAfterRemote');
        error.status = 403;
        console.error(ctx);
        next(error);
      }
  };

  Base.observe('access', function(ctx, next) {
    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
      ctx.query.limit = LIMIT;
    }

    ctx.query.where = ctx.query.where || {};
    ctx.query.where.id = ctx.query.where.id || { gt: app.utils.objectIdWithTimestamp(Date.now() - 2 * ONE_WEEK) };

    /*
    if(ctx.query.include) {
      if(!Array.isArray(ctx.query.include)) {
        ctx.query.include = [ctx.query.include];
      }
    }
    else {
      ctx.query.include = [];
    } 

    ctx.options = ctx.query.options;
    if(!(ctx.options && ctx.options.rate)) {
      //Include any upvotes or downvotes on the object
      var context = loopback.getCurrentContext();
      if(context) {
        var token = context.get('accessToken');
        var username;
        // istanbul ignore else 
        if(token) {
          username =  token.userId;
        }

        // istanbul ignore else
        if(username) {
          ctx.query.include.push({
            relation: 'upVotes',
            scope: {
              where: {
                username: username 
              }
            }
          });
          ctx.query.include.push({
            relation: 'downVotes',
            scope: {
              where: {
                username: username 
              }
            }
          });
        }
      }
    }
   */

    debug('observe.access', ctx);
    next();
  });

  Base.observe('before save', function(ctx, next) {
    debug('observe.before save', ctx);
    var inst = ctx.instance;
    if (!inst) {
      inst = ctx.data;
    }
    if(inst) {


      inst.modified = new Date();
      inst.ratingModified = new Date();
      delete inst.comments;
      delete inst.subarticles;

      if(ctx.isNewInstance) {
        inst.username = undefined;

        var context = loopback.getCurrentContext();
        var token;
        if(context) {
          token = context.get('accessToken');
        }

        if(!token) {
          var err = new Error(
            'There should be a valid user logged in for base creation');
            err.status = 401;
            console.error(err.stack);
            return next(err);
        }

        //TODO add this on loaded and remove on before save
        inst.modelName = ctx.Model.modelName;

        inst.username = token.userId;

        inst.id = null;
        inst.version = 0;
        inst.ratingVersion = 0;
        inst.created = new Date();
        //Counts for rating
        inst.clickCount = 0;
        inst.viewCount = 0;
        inst.upVoteCount = 0;
        inst.downVoteCount = 0;
        //Rating
        inst.rating = 0;

        if(ctx.Model.modelName === 'article') {
          inst.verified = false;
          inst.getSubarticlesCount = 0;
          inst.notSubarticleRating = 1;
        }

        if(!(inst.commentableType && (inst.commentableType === 'comment'))) {
          inst.getCommentsCount = 0;
          inst.notCommentRating = 1;
        }

        var rating = Stat.getRating(inst);
        inst.rating = rating;
      }
      else {
        //TODO move versioning into a mixin for everyone
        //The version cannot be set explicitly
        if(ctx.data.hasOwnProperty('version')) {
          delete ctx.data.version;
        }

        //Ensure that the version number is incremented
        if(!ctx.data.hasOwnProperty('$inc')) {
          ctx.data.$inc = {
            version: 1
          };
        }
        else {
          ctx.data.$inc.version = 1;
        }

        var set = ctx.data.$set;
        if(!set) {
          set = {};
        }

        var names = Object.getOwnPropertyNames(ctx.data);
        for(var i in names) {
          if(names[i].indexOf('$') !== 0) {
            set[names[i]] = ctx.data[names[i]];
            delete ctx.data[names[i]];
          }
        }

        ctx.data.$set = set;

        /*
        if(!ctx.data.$set) {
        ctx.data.$set = {};
        }
        ctx.data.$set.modified = new Date();
        ctx.data.$set.ratingModified = new Date();
        */
        }
    }
    else {
      console.warn('Warning: There does not seem to be an instance present!');
    }

    next();
  });

  /* istanbul ignore next */
  Base.updateStats = function(id, modelName, data, next) {
    debug('updateStats', id, modelName, data, next);
    if(app.models[modelName]) {
      Model = app.models[modelName];
      var whitelist = ['article', 'subarticle', 'comment'];
      if(whitelist.indexOf(modelName) > -1) {
        Model.findById(id, function (err, instance) {
          if(err) {
            console.error('Failed to find the instance of ' + modelName + ' - ' + id); 
            return next(err);
          } else {
            instance.updateAttributes(data, function(err,res) {
              if(err) {
                console.warn('Failed to save base instance');
                console.dir(instance);
                next(err);
              }
              else {
                Stat.triggerRating({
                  id: instance.id 
                },
                instance.modelName,
                null,
                function(err, res) {
                  if(err) { 
                    //Conflicts are ok because it means that 
                    //someone else has just triggered the rating.
                    //So we will not throw an error
                    console.error('Failed to update the rating for ' +
                                  instance.modelName + ' - ' + instance.id);
                    console.error(err.stack);
                    return next(err);
                  }
                  next();
                }); 
              }
            });
          }
        });
      } else {
        console.warn('Base.updateStats can only be called on models that inherit Base');
        return next();
      }
    } else {
      var err = new Error('The given modelName ' + modelName + ' does not have a valid model');
      console.error(err);
      return next(err);
    }
  };

  /*
     Base.observe('loaded', function(ctx, next) {
     debug('observe.loaded', ctx);
     var instance = ctx.instance;

     if(instance && ctx.options.rate) {
     Stat.getCustomRating(ctx.Model, instance, function(err, inst) {
     if(err) {
     console.error('Error: Failed to getCustomRating for ' +
     ctx.Model.modelName + ' ' + instance.id);
     console.error(err.stack);
     next(err);
     }
     else {
     ctx.instance.rating = inst.rating;
     next();
     }
     });
     }
     else {
     next();
     }
     });
     */
};
