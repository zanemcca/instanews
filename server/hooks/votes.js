
module.exports = function(app) {

   var Votes = app.models.votes;

   var getRating = function(instance) {
      return  (instance.upVoteCount - instance.downVoteCount);
   };

   Votes.observe('before save', function(ctx, next) {

      var inst = ctx.instance;
      if (inst) {

         if(ctx.isNewInstance) {
            inst.id = null;
            inst.upVoteCount = 0;
            inst.downVoteCount = 0;
            inst.date = Date.now();
         }

         //Update the rating
         inst.rating = getRating(inst);
         //Update the modification date
         inst.lastUpdated = Date.now();
      }

      next();
   });
};
