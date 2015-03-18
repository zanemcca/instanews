module.exports = function(UpVote) {

   UpVote.observe('after save', function(ctx, next) {

      var Model;

      switch(ctx.instance.votableType) {
         case 'article':
            Model = ctx.Model.app.models.Article;
            break;
         case 'subarticle':
            Model = ctx.Model.app.models.Subarticle;
            break;
         case 'comment':
            Model = ctx.Model.app.models.Comment;
            break;
         default:
            console.log('Error: bad votableType');
            next();
      }

      Model.findOne({
         where: {
            myId: ctx.instance.votableId
         }
      }, function(err, instance) {
         /* jshint camelcase: false */
         if (err) console.log('Error: ' + err);
         instance.__count__upVotes( function(err, res) {
            instance.upVoteCount = res;
            //console.log('Up Count: ' + res);
            instance.save( function(err, res) {
               if (err) console.log('Error: ' + err);
               ctx.instance.upVoteCount = instance.upVoteCount;
               ctx.instance.rating = res.rating;
               next();
            });
         });
      });
   });
};
