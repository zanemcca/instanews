var common = require('./common');

module.exports = function(Votes) {
   common.initVotes(Votes);

   Votes.observe('before save', function(ctx, next) {
      if ( ctx.instance) {
         ctx.instance.rating = ctx.instance.upVoteCount -
                              ctx.instance.downVoteCount;
      }
      next();
   });
};
