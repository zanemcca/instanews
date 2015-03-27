var common = require('./common');

module.exports = function(Votes) {
   common.initVotes(Votes);

   Votes.observe('before save', function(ctx, next) {
      var inst = ctx.instance;
      if ( inst) {
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
