
module.exports = function(app) {

   var Votes = app.models.votes;

   Votes.observe('before save', function(ctx, next) {


      var generateId = function() {
         return Math.floor(Math.random()*Math.pow(2,128));
      };

      var inst = ctx.instance;
      if (inst) {

         if(ctx.isNewInstance) {
            console.log('New comment!!');
            if(!inst.myId ) {
               inst.myId = generateId();
            }
         }
         if ( !inst.upVoteCount ) {
            inst.upVoteCount = 0;
         }
         if ( !inst.downVoteCount ) {
            inst.downVoteCount = 0;
         }

         inst.rating = inst.upVoteCount - inst.downVoteCount;

         if( !inst.date ) {
            inst.date = Date.now();
         }

         inst.lastUpdated = Date.now();

      }
      next();
   });
};
