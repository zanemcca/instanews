module.exports = function(app) {

  var UpVote = app.models.upVote;
  var Stat = app.models.Stat;
  var Click = app.models.click;
  var Notification = app.models.notif;
  var Installation = app.models.installation;
   
  UpVote.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {

      if(ctx.inc && typeof(ctx.inc) === 'object') {
        ctx.inc.upVoteCount = 1;
        Click.updateClickableAttributes(ctx, { 
          '$inc': ctx.inc 
        }, function(err) {
          if(err) {
            next(err);
          }
          else {
            //Possibly move this to clicks
            Stat.triggerRating({
              id: inst.clickableId
            },
            inst.clickableType,
            null,
            function(err, res) {
              if(err) { 
                console.log('Error: Failed to update the rating for ' +
                            inst.clickableType + ' - ' + inst.clickableId +
                            ' from upvote ' + inst.id);
                next(err);
              }
              else {
                if(res !== 1) {
                  console.log('Warning: ' + res + ' ' + inst.clickableType +
                              ' were updated for id:' + inst.clickableId +
                              ' when there should have been one');
                }
                next();
              }
            }); 
          }
        });
      }
      else {
        var error = new Error('Upvote expected there to be ctx.inc!');
        console.log(error);
        next(error);
      }
    }
    else {
      console.log('Warning: Invalid instance for upvote!');
    }
  });

  //Send notifications
   UpVote.observe('after save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst && ctx.isNewInstance) {

        //TODO ReWrite notifications

         //Create notifications for whoever needs one
         switch(inst.clickableType) {
            case 'article':
               /*
               //Notify the original poster
               app.models.Article.findById( inst.clickableId,
               function(err, res) {
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
                     parentId: inst.clickableId
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
                              notifiableId: inst.clickableId,
                              notifiableType: 'article',
                              messageFrom: inst.username,
                              username: username
                           }, function(err, res) {
                              if (err) console.log('Error: ' + err);
                              /*
                              else {
                                 console.log('Created a notification!');
                              }
                              */
                           });
                        }
                     }
                  }
               });
               break;
            case 'subarticle':
               app.models.Subarticle.findById( inst.clickableId,
               function(err,res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     if( username !== inst.username) {
                        var message = inst.username +
                           ' voted on your subarticle';

                        Notification.create({
                           message: message,
                           notifiableId: inst.clickableId,
                           notifiableType: 'subarticle',
                           messageFrom: inst.username,
                           username: username
                        }, function(err, res) {
                           if (err) console.log('Error: ' + err);
                           /*
                           else {
                              console.log('Created a notification!');
                           }
                           */
                        });
                     }
                  }
               });
               break;
            case 'comment':
               app.models.Comment.findById( inst.clickableId,
               function(err,res) {
                  if (err) console.log('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     if( username !== inst.username) {
                        var message = inst.username +
                           ' voted on your comment';

                        Notification.create({
                           message: message,
                           notifiableId: inst.clickableId,
                           notifiableType: 'comment',
                           messageFrom: inst.username,
                           username: username
                        }, function(err, res) {
                           if (err) console.log('Error: ' + err);
                           /*
                           else {
                              console.log('Created a notification!');
                           }
                           */
                        });
                     }
                  }
               });
               break;
            default:
               console.log('Unknown clickable type!');
         }

      }
      else {
         console.log('After saving vote the instance is null');
      }
      next();
   });
};
