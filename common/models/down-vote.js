module.exports = function(DownVote) {

   DownVote.observe('after save', function(ctx, next) {

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
         instance.__count__downVotes( function(err, res) {
            instance.downVoteCount = res;
//            console.log('down Count: ' + res);
            instance.save( function(err, res) {
               if (err) console.log('Error: ' + err);
               ctx.instance.downVoteCount = instance.downVoteCount;
               ctx.instance.rating = res.rating;
               next();
            });
         });
      });
   });
};
