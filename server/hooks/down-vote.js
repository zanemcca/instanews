module.exports = function(app) {

   var DownVote = app.models.downVote;

   DownVote.observe('after save', function(ctx, next) {

      ctx.instance.votable( function(err, instance) {
         if(err) {
            console.log('Error: ' + err);
            next(err);
         }
         else if(instance) {
            instance.downVoteCount += 1;
            instance.save( function(err, res) {
               if (err) {
                  console.log('Error: ' + err);
                  next(err);
               }
               else {
                  // ????? I dont think we need to be updating the
                  // downvote object.
                  // Check the front end before taking it out
                  ctx.instance.downVoteCount = instance.downVoteCount;
                  ctx.instance.rating = res.rating;
                  next();
               }
            });
         }
         else {
            console.log('Warning: Votable instance was not found');
            next();
         }
      });

   });
};
