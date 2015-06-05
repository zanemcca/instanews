
module.exports = function(app) {

   var Comment = app.models.comment;
   var Notification = app.models.notif;

   var report = function(err,res) {
      if (err) console.log('Error: ' + err);
      else {
         //console.log('Created a notification!');
      }
   };

   Comment.observe('after save', function(ctx, next) {
      var inst = ctx.instance;

      //List of already notified users
      var users = [];

      var notify = function(message, id, models) {
         var username;
         if(models) {
            if( models.length ) {
               for(var i = 0; i < models.length; i++) {
                  if( users.indexOf(models[i].username) === -1) {
                     username = models[i].username;
                     //console.log('Starting push to '+ username +'...');

                     Notification.create({
                        message: message,
                        notifiableId: id,
                        notifiableType: 'comment',
                        messageFrom: inst.username,
                        username: username
                     }, report );

                     users.push(models[i].username);
                  }
               }
            }
            else {
               if( users.indexOf(models.username) === -1) {
                  username = models.username;
                  //console.log('Starting push to '+ username +'...');

                  Notification.create({
                     message: message,
                     notifiableId: id,
                     notifiableType: 'comment',
                     messageFrom: inst.username,
                     username: username
                  }, report);

                  users.push(models.username);
               }
            }
         }
         else {
            console.log('Invalid models! Cannot create a notification');
         }
      };

      if (inst && ctx.isNewInstance) {

         users.push(inst.username);

         var Model = {};

         switch(inst.commentableType) {
            case 'article':
               Model = app.models.Subarticle;
               Model.find({
                  where: {
                     parentId: inst.commentableId
                  }
               }, function(err, res) {
                  if (err) {
                     console.log(
                        'Error retrieving items for comment notification');
                  }
                  else {
                     var message = inst.username +
                        ' commented on an article you contributed to';

                     notify(message, inst.id, res);
                  }
               });
               break;
            case 'subarticle':
               Model = app.models.Subarticle;
               Model.findById(inst.commentableId, function(err, res) {
                  if (err) {
                     console.log(
                        'Error retrieving items for comment notification');
                  }
                  else {
                     var message = inst.username +
                        ' commented on your subarticle';
                     notify(message, inst.id, res);
                  }
               });
               break;
            case 'comment':
               Model = app.models.Comment;

               Model.findById(inst.commentableId, function(err, res) {
                  if (err) {
                     console.log(
                        'Error retrieving items for comment notification');
                  }
                  else {
                     var message = inst.username + ' commented on your comment';
                     notify(message, inst.id, res);
                  }
               });
               Model.find({
                  where: {
                     commentableId: inst.commentableId,
                     commentableType: inst.commentableType
                  }
               }, function(err, res) {
                  if (err) {
                     console.log(
                        'Error retrieving items for comment notification');
                  }
                  else {
                     var message = inst.username +
                        ' commented on a comment stream that you are part of';
                     notify(message, inst.id, res);
                  }
               });
               break;
            default:
               console.log('Error: bad votableType');
               next();
         }

      }
      next();

   });

   Comment.observe('before save', function(ctx, next) {

      var inst = ctx.instance;
      if(inst && ctx.isNewInstance) {
         inst.modelName = 'comment';
      }

      next();
   });
};
