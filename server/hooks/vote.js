
module.exports = function(app) {

   var Notification = app.models.notification;
   var Installation = app.models.installation;
   var Push = require('./push');
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
                           Push.notifyUser(app,{
                              username: username,
                              message: message,
                              type: 'article',
                              parentId: inst.votableId
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
                        Push.notifyUser(app,{
                           username: username,
                           message: message,
                           parentId: inst.votableId,
                           type: 'subarticle'
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
                        Push.notifyUser(app, {
                           username: username,
                           message: message,
                           parentId: inst.votableId,
                           type: 'comment'
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
