
/* jshint camelcase: false */
var LIMIT = 50;

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
    if(
      ctx &&
      ctx.req &&
      ctx.req.remotingContext &&
      ctx.req.remotingContext.instance &&
      ctx.req.remotingContext.instance.id
    ){
      //TODO Unblock this
      var context = loopback.getCurrentContext();
      if(context) {
        var stat = context.get('currentStat');
        if(stat.username) {
          var click = {
            username: stat.username,
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
      var error = new Error('Invalid context for prototype.__get__comments');
      error.status = 403;
      console.error(ctx);
      next(error);
    }
  };

  Base.observe('access', function(ctx, next) {
    debug('observe.access', ctx);
    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
       ctx.query.limit = LIMIT;
    }

    if(ctx.query.include) {
      if(!Array.isArray(ctx.query.include)) {
        ctx.query.include = [ctx.query.include];
      }
    }
    else {
     ctx.query.include = [];
    } 
    //Include any upvotes or downvotes on the object
    var context = loopback.getCurrentContext();
    if(context) {
      var stat = context.get('currentStat');
      var username;
      if(stat) {
        username =  stat.username;
      }

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

        //If we want to rerate the content then we need to load
        //the top comments
        if(ctx.query.rate) {
          ctx.query.include.push({
            relation: 'comments',
            scope: {
              limit: stat.comment.views.mean,
              order: 'rating DESC'
            }
          });
        }
      }
    }
    if(ctx.query.rate) {
      ctx.options.rate = true;
    }

    next();
  });

   Base.observe('before save', function(ctx, next) {
    debug('observe.before save', ctx);
      var inst = ctx.instance;
      if (!inst) {
        inst = ctx.data;
      }
      if(inst) {
         //TODO use a mixin for this 
         //Update the modification date
         inst.modified = new Date();
         inst.ratingModified = new Date();

         delete inst.comments;
         delete inst.subarticles;

         if(ctx.isNewInstance) {
            inst.username = undefined;

            var context = loopback.getCurrentContext();
            var rawStat;
            if(context) {
              rawStat = context.get('currentStat');
            }

            if(!rawStat) {
              var err = new Error(
                'There should be a valid user logged in for base creation');
              err.status = 401;
              console.error(err.stack);
              return next(err);
            }

            //TODO add this on loaded and remove on before save
            inst.modelName = ctx.Model.modelName;

            inst.username = rawStat.username;

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

            var stats;
            if(ctx.Model.modelName === 'comment') {
              stats = Stat.convertRawStats(Comment, rawStat);
            }
            else {
              if(ctx.Model.modelName === 'article') {
                inst.verified = false;
                stats = Stat.convertRawStats(Article, rawStat);
              }
              else {
                stats = Stat.convertRawStats(Subarticle, rawStat);
              }
            }

            var res = Stat.getRating(inst,stats);
            inst.rating = res.rating;
         }
         else {
           //TODO move versioning into a mixin for everyone
           //The version cannot be set explicitly
           if(ctx.data.hasOwnProperty('version')) {
             delete ctx.data.version;
           }

           //Ensure that the version number is incremented
           if(!ctx.data.hasOwnProperty('$inc')) {
             ctx.data = {
               $set: ctx.data,
               $inc: {
                 version: 1
               }
             };
           }
           else {
             ctx.data.$inc.version = 1;
           }
         }
      }
      else {
        console.warn('Warning: There does not seem to be an instance present!');
      }

      next();
   });

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
};
