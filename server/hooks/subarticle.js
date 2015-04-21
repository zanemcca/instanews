
module.exports = function(app) {

   var Subarticle = app.models.subarticle;
   var Push = require('./push');

   Subarticle.observe('before save', function(ctx, next) {
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         inst.modelName = 'subarticle';
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
                     Push.notifyUser(app, {
                        username: username,
                        message: message,
                        parentId: inst.id,
                        type: 'subarticle'
                     });

                     users.push(res[i].username);
                  }
               }
            }
         });
      }
      next();
   });
};
