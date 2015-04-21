
module.exports = function(app) {

   var Notification = app.models.notif;
   var Installation = app.models.installation;
   var Vote = app.models.vote;

   Vote.observe('before save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst && ctx.isNewInstance) {
         inst.id = null;
      }
      next();
   });

   Vote.observe('after save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst && ctx.isNewInstance) {

         //Create notifications for whoever needs one
         switch(inst.votableType) {
            case 'article':
               /*
               //Notify the original poster
               app.models.Article.findById( inst.votableId, function(err, res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     var message = inst.username + ' voted on your article';
                     Push.notifyUser(app, username, message);
                  }
               });
               */
               //Notify the top contributer
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
                           var message = inst.username +
                                    ' voted on your article';

                           Notification.create({
                              message: message,
                              notifiableId: inst.votableId,
                              notifiableType: 'article',
                              messageFrom: inst.username,
                              username: username
                           }, function(err, res) {
                              if (err) console.log('Error: ' + err);
                              else {
                                 console.log('Created a notification!');
                              }
                           });
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

                        Notification.create({
                           message: message,
                           notifiableId: inst.votableId,
                           notifiableType: 'subarticle',
                           messageFrom: inst.username,
                           username: username
                        }, function(err, res) {
                           if (err) console.log('Error: ' + err);
                           else {
                              console.log('Created a notification!');
                           }
                        });
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

                        Notification.create({
                           message: message,
                           notifiableId: inst.votableId,
                           notifiableType: 'comment',
                           messageFrom: inst.username,
                           username: username
                        }, function(err, res) {
                           if (err) console.log('Error: ' + err);
                           else {
                              console.log('Created a notification!');
                           }
                        });
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
