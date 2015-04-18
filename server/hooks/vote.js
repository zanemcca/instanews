
module.exports = function(app) {

   var Notification = app.models.notification;
   var Installation = app.models.installation;
   var Push = require('./push');
   var Vote = app.models.vote;

   Vote.observe('after save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst && ctx.isNewInstance) {

         //Create notifications for whoever needs one
         switch(inst.votableType) {
            case 'article':
               /*
               app.models.Article.findById( inst.votableId, function(err, res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     var message = inst.username + ' voted on your article';
                     Push.notifyUser(app, username, message);
                  }
               });
               */
               app.models.Subarticle.find({
                  limit: 1,
                  order: 'rating DESC',
                  where: {
                     parentId: inst.votableId
                  }
               }, function(err, res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     if( res.length > 0) {
                        var username = res[0].username;

                        if( username !== inst.username) {
                           var message = inst.username + ' voted on your article';
                           Push.notifyUser(app, username, message);
                        }
                     }
                  }
               });
               break;
            case 'subarticle':
               app.models.Subarticle.findById( inst.votableId,
               function(err,res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     if( username !== inst.username) {
                        var message = inst.username +
                           ' voted on your subarticle';
                        Push.notifyUser(app, username, message);
                     }
                  }
               });
               break;
            case 'comment':
               app.models.Comment.findById( inst.votableId,
               function(err,res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     if( username !== inst.username) {
                        var message = inst.username +
                           ' voted on your comment';
                        Push.notifyUser(app, username, message);
                     }
                  }
               });
               break;
            default:
               console.log('Unknown votable type!');
               next();
         }

      }
      else {
         console.log('After saving vote the instance is null');
      }
      next();
   });
};
