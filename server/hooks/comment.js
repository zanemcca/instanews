
module.exports = function(app) {

   var Comment = app.models.comment;
   var Push = require('./push');

   Comment.observe('after save', function(ctx, next) {
      var inst = ctx.instance;

      //List of already notified users
      var users = [];

      var notify = function(message, res) {
         var username;
         if( res.length ) {
            for(var i = 0; i < res.length; i++) {
               if( users.indexOf(res[i].username) === -1) {
                  username = res[i].username;
                  console.log('Starting push to '+ username +'...');

                  Push.notifyUser(app, username, message);

                  users.push(res[i].username);
               }
            }
         }
         else {
            if( users.indexOf(res.username) === -1) {
               username = res.username;
               console.log('Starting push to '+ username +'...');

               Push.notifyUser(app, username, message);

               users.push(res.username);
            }
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
                     notify(message, res);
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
                     notify(message, res);
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
                     notify(message, res);
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
                     notify(message, res);
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

      this.date =  Date.now();

      next();
   });
};
