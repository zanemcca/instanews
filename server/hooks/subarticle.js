
module.exports = function(app) {

   var Subarticle = app.models.subarticle;
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
