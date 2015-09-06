
module.exports = function(app) {

   var Comment = app.models.comment;
   var Click = app.models.click;
   var Notification = app.models.notif;
   var Stat = app.models.stat;
  var Votes = app.models.votes;

   var report = function(err,res) {
      if (err) console.log('Error: ' + err);
      else {
         //console.log('Created a notification!');
      }
   };

   /*
  Comment.observe('before save', function(ctx, next) {
    //TODO It should make sure the comment has 
    //a commentableType and id and username
    console.log('Made it');
    next();
  });
  */

  Comment.afterRemote('prototype.__get__comments', function(ctx, instance,next){
    Votes.createClickAfterRemote(ctx, next);
  });

  Comment.observe('after save', function(ctx, next) {
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      Click.create({
        username: inst.username,
        clickableType: inst.commentableType,
        clickableId: inst.commentableId
      }, function(err, res) {
        if(err) {
          console.log('Error: Failed to create a click for comment creation');
        }
        next(err);
      });
    }
    else {
      if(!inst) {
        console.log('Warning: Instance is not valid for comment after save');
      }
      next();
    }
  });

   Comment.observe('after save', function(ctx, next) {
       //TODO Rewrite notifications
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

  Comment.triggerRating = function(where, modify, cb) {
    Stat.updateRating(where, Comment.modelName, modify, function(err, res) {
      if(err) {
        console.log('Warning: Failed to update a comment');
        cb(err);
      }
      else {
        var query = {
          where: where,
          limit: 1
        };

        Comment.find(query, function(err, res) {
          if(err) {
            console.log('Warning: Failed to find comment');
            cb(err);
          }
          else if(res.length > 0) {
            Stat.triggerRating({
              id: res[0].commentableId
            }, res[0].commentableType, null, cb);
          }
          else {
            console.log(
              'Warning: No Comments were found.' +
              'Cannot trigger commentable rating');
          }
        });
      }
    });
  };
};
