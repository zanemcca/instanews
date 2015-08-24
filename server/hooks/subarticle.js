
module.exports = function(app) {

   var Subarticle = app.models.subarticle;
   var Stat = app.models.stat;
   var Notification = app.models.notif;

   Subarticle.observe('before save', function(ctx, next) {
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         inst.modelName = 'subarticle';
         if ( inst._file ) {
            if ( inst._file.type === 'video') {
               //console.log('Saving a video');
               if ( !inst._file.poster ) {
                  inst._file.poster = 'img/ionic.png';
               }
            }
            else {
               //console.log('Saving some other media type');
            }
         }
      }

      next();
   });

   //TODO before create - initialize its rating
  //TODO on loaded - update the rating of the subarticle for the user loading it

  Subarticle.updateRating = function(id, rawStats, rate, cb, staticChange) {
    var commentView;
    var ageQ = Stat.getAgeQFunction(rawStats.subarticle.age);

    var query = {
      where: {
        id: id 
      },
      include: []
    }

    if(staticChange) {
      commentView = Stat.getGeometricStats(rawStats.comment.views);
      query.include.push({
        relation: 'comments',
        scope: {
          limit: commentView.mean,
          order: 'rating DESC'
        } 
      });
    }

    var total = rawStats.comment.age.count +
                rawStats.upVote.age.count;

    var stats = {
      age: ageQ,
      views: {
        comments: commentView
      },
      Pcomments: rawStats.comment.age.count/total,
      Pvotes: rawStats.upVote.age.count/total
    };

    Subarticle.readModifyWrite(query, rate(stats), function(err, res) {
      if(err) {
        console.log('Error: Failed to modify subarticle');
        console.log(err);
        cb(err, res);
      }
      cb(null, res);
    });
  };

   Subarticle.observe('after save', function(ctx, next) {
     
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         //Find all subarticles associated with this article
         Subarticle.find({
            where: {
               parentId: inst.parentId
            }
         }, function(err, res) {
            //Error checking
            if(err) console.log(err);
            else {

               var report = function(err, res) {
                  if (err) console.log('Error: ' + err);
                  else {
                     //console.log('Created a notification!');
                  }
               };

               //List of already notified users
               var users = [
                  inst.username
               ];
               for( var  i = 0; i < res.length; i++) {
                  if ( users.indexOf(res[i].username) === -1) {
                     //Send a notification to each user
                     //associated with the parent article
                     var username = res[i].username;
                     var message = inst.username +
                        ' collaborated with you on an article';

                     Notification.create({
                        message: message,
                        notifiableId: inst.parentId,
                        notifiableType: 'article',
                        messageFrom: inst.username,
                        username: username
                     }, report);

                     users.push(res[i].username);
                  }
               }
            }
         });
      }
      next();
   });
};
