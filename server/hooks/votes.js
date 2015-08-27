
var LIMIT = 20;

module.exports = function(app) {

  var loopback = require('loopback');
   var Votes = app.models.votes;
   var Stat = app.models.Stat;

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
            inst.clicks = 1;
            inst.views = 1;
            inst.upVoteCount = 0;
            inst.downVoteCount = 0;
            inst.rating = 0;
            inst.commentRating = 0;

            //TODO depricate date in preference of created
            inst.date = new Date();
            inst.created = new Date();

            if(ctx.Model.modelName !== 'comment') {
              inst.staticRating = 0;
              if(ctx.Model.modelName === 'article') {
                inst.verified = false;
              }
            }
         }
         else {
           inst.version++;
         }

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
          console.log('Error: Failed to getCustomRating for ' + ctx.Model.modelName +
                      ' ' + instance.id);
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
