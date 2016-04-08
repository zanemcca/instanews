
/* jshint camelcase: false */

module.exports = function(app) {

  var ONE_DAY = 24*60*60*1000; // 1 Day in millisecs
  var ONE_WEEK = 7*ONE_DAY; // 1 Week in millisecs
  var ONE_MONTH = 30*ONE_DAY; // 1 Month in millisecs

  var UpVote = app.models.upVote;
  var Stat = app.models.Stat;
  var Click = app.models.click;
  var Notification = app.models.notif;
  var Installation = app.models.installation;
  var debug = app.debug('hooks:upVote');
   
  UpVote.observe('after delete', function(ctx, next) {
    var dd = app.DD('UpVote', 'afterDelete');
    debug('after delete', ctx, next);

    //TODO Check the deletion count to make sure an item was deleted before decrementing upVoteCount
    if(ctx.inc && typeof(ctx.inc) === 'object') {
      ctx.inc.upVoteCount = -1;
    } else {
      ctx.inc = {
        upVoteCount: -1
      };
    }
    Click.updateVoteParent(ctx, function(err) {
      dd.lap('Click.updateVoteParent');
      next(err);
    });

    /*
    //The click after save should have added an incrementation parameter
    if(ctx.inc && typeof(ctx.inc) === 'object') {
      ctx.inc.upVoteCount = -1;
      Click.updateVoteParent(ctx, next);
    } else if(ctx.where) {
      //TODO deal with deletion of multiple votes
      console.warn('warning: Strange upvote deletion request!');
      console.warn(ctx.where);
      next();
    }
    else {
      var error = new Error('Upvote  deletion expected there to be ctx.inc!');
      error.status = 400;
      console.error(error.stack);
      next(error);
    }
   */
  });

  UpVote.observe('access', function(ctx, next) {
    //console.log(objectIdWithTimestamp(Date.now() - 2*ONE_WEEK));
    ctx.query.where = ctx.query.where || {};
    ctx.query.where.id = ctx.query.where.id || { gt: app.utils.objectIdWithTimestamp(Date.now() - 2 * ONE_WEEK) };

    debug('observe.access', ctx);
    next();
  });

  UpVote.observe('after save', function(ctx, next) {
    var dd = app.DD('UpVote', 'afterSave');
    debug('after save', ctx, next);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      dd.increment('UpVote', ['instanceId:' + inst.clickableId,'instanceType:' + inst.clickableType, 'viewId:' + inst.viewableId]);
      UpVote.notify(inst);
      //The click after save should have added an incrementation parameter
      if(ctx.inc && typeof(ctx.inc) === 'object') {
        ctx.inc.upVoteCount = 1;
        Click.updateVoteParent(ctx, function(err) {
          dd.lap('Click.updateVoteParent');
          next(err);
        });
      }
      else {
        var error = new Error('Upvote expected there to be ctx.inc!');
        error.status = 400;
        console.error(error.stack);
        next(error);
      }
    }
    else {
      console.warn('Warning: Invalid instance for upvote!');
      next();
    }
  });

  //Send notifications
  /*
  // istanbul ignore next
   UpVote.observe('after  save', function(ctx, next) {
    debug('after save', ctx, next);
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
                  if (err) console.error('Error after saving vote: ' + err);
                  else {
                     var username = res.username;

                     var message = inst.username + ' voted on your article';
                     Push.notifyUser(app, username, message);
                  }
               });
               */
              /*
               //Notify the top contributer
               app.models.Subarticle.find({
                  limit: 1,
                  order: 'rating DESC',
                  where: {
                     parentId: inst.clickableId
                  }
               }, function(err, res) {
                  if (err) console.error(err.stack);
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
                              if (err) console.error(err.stack);
                           });
                        }
                     }
                  }
               });
               break;
            case 'subarticle':
               app.models.Subarticle.findById( inst.clickableId,
               function(err,res) {
                  if (err) console.error(err.stack);
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
                           if (err) console.error(err.stack);
                        });
                     }
                  }
               });
               break;
            case 'comment':
               app.models.Comment.findById( inst.clickableId,
               function(err,res) {
                  if (err) console.error(err.stack);
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
                           if (err) console.error(err.stack);
                        });
                     }
                  }
               });
               break;
            default:
               console.warn('Unknown clickable type!');
         }

      }
      else {
         console.warn('After saving vote the instance is null');
      }
      next();
   });
   */
};
