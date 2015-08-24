
var LIMIT = 10;

module.exports = function(app) {

   var Votes = app.models.votes;

   var getRating = function(instance) {
      var rating =  instance.upVoteCount - instance.downVoteCount;
      return rating;
   };

  Votes.observe('access', function(ctx, next) {
    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
           ctx.query.limit = LIMIT;
    }
    next();
  });

  /*
  Votes.observe('loaded', function(ctx, next) {
    if(ctx.instance) {
      ctx.instance.rating = getRating(ctx.instance);
    }
    next();
  });
 */

   Votes.observe('before save', function(ctx, next) {

      var inst = ctx.instance;
      if (!inst) {
        inst = ctx.data;
      }
      if(inst) {

         if(ctx.isNewInstance) {
            inst.id = null;
            inst.upVoteCount = 0;
            inst.downVoteCount = 0;
            inst.rating = 0;
            inst.date = new Date();
            inst.verified = false;
            inst.version = 0;
            inst.clicks = 1;
            inst.views = 1;
         }
         else {
           inst.version++;
         }

         //Update the rating
        // inst.rating = getRating(inst);
         //Update the modification date
         inst.modified = new Date();

          //TODO Depricate lastUpdated and use only modified
         inst.lastUpdated = new Date();
      }
      else {
        console.log('Warning: There does not seem to be an instance present!');
      }

      next();
   });
};
