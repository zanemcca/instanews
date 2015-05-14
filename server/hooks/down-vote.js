module.exports = function(app) {

   var DownVote = app.models.downVote;

   DownVote.observe('after save', function(ctx, next) {


      //ctx.instance.__get__votable( function(err, instance) {
      ctx.instance.votable( function(err, instance) {
         if(err) {
            console.log('Error: ' + err);
            next(err);
         }
         else {
            instance.downVoteCount += 1;
            instance.save( function(err, res) {
               if (err) {
                  console.log('Error: ' + err);
                  next(err);
               }
               else {
                  ctx.instance.downVoteCount = instance.downVoteCount;
                  ctx.instance.rating = res.rating;
                  next();
               }
            });
         }
      });

   });
};
