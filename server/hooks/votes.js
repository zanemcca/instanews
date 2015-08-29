
var LIMIT = 50;

module.exports = function(app) {

  var loopback = require('loopback');
  var Votes = app.models.votes;
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
    ctx.options.rate = ctx.query.rate;
    next();
  });

   Votes.observe('before save', function(ctx, next) {

      var inst = ctx.instance;
      if (!inst) {
        inst = ctx.data;
      }
      if(inst) {
         //TODO before create - initialize its rating
         if(ctx.isNewInstance) {
            inst.modelName = ctx.Model.modelName;
            inst.id = null;
            inst.version = 0;
            inst.created = new Date();
            //Counts for rating
            inst.clickCount = 100;
            inst.viewCount = 100;
            inst.upVoteCount = 0;
            inst.downVoteCount = 0;
            //Stored copy of the static commentRating
            inst.commentRating = 0;
            //Rating
            inst.rating = 0;

            if(ctx.Model.modelName !== 'comment') {
              inst.staticRating = 0;
              if(ctx.Model.modelName === 'article') {
                inst.verified = false;
              }
            }
         }

         //TODO use a mixin for this 
         //Update the modification date
         inst.modified = new Date();
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
          ctx.instance = inst;
          next();
        }
       });
     }
     else {
       next();
     }
   });

};
