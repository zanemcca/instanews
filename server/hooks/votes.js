
var LIMIT = 50;

module.exports = function(app) {

  var loopback = require('loopback');
  var Votes = app.models.votes;
  var Article = app.models.article;
  var Subarticle = app.models.subarticle;
  var Comment = app.models.comment;
  var Stat = app.models.Stat;
  var Click = app.models.Click;

  Votes.createClickAfterRemote = function(ctx, next){
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
        if(stat) {
          if(stat.username) {
            var click = {
              username: stat.username,
              clickableType: ctx.req.remotingContext.instance.modelName,
              clickableId: ctx.req.remotingContext.instance.id
            };
            Click.create(click, function(err, res) {
              if(err) {
                console.log(err);
                next(err);
              }
              next();
            });
          }
          else {
            next();
          }
        }
        else {
          console.log('Warning: No stat object was found!');
          next();
        }
      }
      else {
        console.log('Warning: No context object was found!');
        next();
      }
    }
    else {
      var error = new Error('Invalid context for prototype.__get__comments');
      console.log(ctx);
      next(error);
    }
  };

  Votes.observe('access', function(ctx, next) {
    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
       ctx.query.limit = LIMIT;
    }
    //Include any upvotes or downvotes on the object
    var context = loopback.getCurrentContext();
    if(context) {
      var token = context.get('accessToken');
      if(token) {
        if(ctx.query.include) {
          if(typeof(ctx.query.include) === 'object') {
            ctx.query.include = [ctx.query.include];
          }
        }
        else {
         ctx.query.include = [];
        } 
        ctx.query.include.push({
          relation: 'upVotes',
          scope: {
            where: {
              username: token.userId
            }
          }
        });
        ctx.query.include.push({
          relation: 'downVotes',
          scope: {
            where: {
              username: token.userId
            }
          }
        });
      }
    }
    ctx.options.rate = ctx.query.rate;
    next();
  });

   Votes.observe('before save', function(ctx, next) {

      var inst = ctx.instance;
      if (!inst) {
        inst = ctx.data;
      }
      if(inst) {
         if(ctx.isNewInstance) {
            inst.username = undefined;

            var context = loopback.getCurrentContext();
            var rawStat;
            if(context) {
              rawStat = context.get('currentStat');
              if(rawStat) {
                inst.username = rawStat.username;
              }
            }

            if(!inst.username) {
              console.log('Error: ' +
                'There should be a valid user logged in for votes creation');
            }

            //TODO add this on loaded and remove on before save
            inst.modelName = ctx.Model.modelName;

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
              inst.staticRating = 0;
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
            inst.staticRating = res.staticRating;
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
             }
           }
           else {
             ctx.data['$inc'].version = 1;
           }
         }

         //TODO use a mixin for this 
         //Update the modification date
         inst.modified = new Date();
         inst.ratingModified = new Date();
      }
      else {
        console.log('Warning: There does not seem to be an instance present!');
      }
      next();
   });

   Votes.observe('loaded', function(ctx, next) {
     var instance = ctx.instance;
     if(!instance) {
       instance = ctx.data;
     }
     if(instance && ctx.options.rate) {
       Stat.getCustomRating(ctx.Model, instance, function(err, inst) {
        if(err) {
          console.log('Error: Failed to getCustomRating for ' +
                      ctx.Model.modelName + ' ' + instance.id);
          console.log(err);
          next(err);
        }
        else {
          ctx.instance.rating = inst.rating;
          ctx.instance.staticRating = inst.staticRating;
          ctx.instance.commentRating = inst.commentRating;
          next();
        }
       });
     }
     else {
       next();
     }
   });

};
