
var LIMIT = 10;

module.exports = function(app) {

   var Votes = app.models.votes;

   var getRating = function(instance) {
      return  (instance.upVoteCount - instance.downVoteCount);
   };

	Votes.observe('access', function(ctx, next) {
	  //Limit the queries to LIMIT per request
	  if( !ctx.query.limit || ctx.query.limit > LIMIT) {
		 ctx.query.limit = LIMIT;
	  }
	  next();
	});

   Votes.observe('before save', function(ctx, next) {

      var inst = ctx.instance;
      if (inst) {

         if(ctx.isNewInstance) {
            inst.id = null;
            inst.upVoteCount = 0;
            inst.downVoteCount = 0;
            inst.date = new Date();
         }

         //Update the rating
         inst.rating = getRating(inst);
         //Update the modification date
			//TODO Depricate lastUpdated and use only modified
         inst.lastUpdated = new Date();
         inst.modified = new Date();
      }

      next();
   });
};
