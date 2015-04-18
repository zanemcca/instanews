
module.exports = function(app) {

   var Votes = app.models.votes;

   var getRating = function(instance) {
      return  (instance.upVoteCount - instance.downVoteCount);
   };

   Votes.observe('before save', function(ctx, next) {
      var generateId = function() {
         return Math.floor(Math.random()*Math.pow(2,128));
      };

      var inst = ctx.instance;
      if (inst) {

         if(ctx.isNewInstance) {
            if(!inst.myId ) {
               inst.myId = generateId();
            }
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
