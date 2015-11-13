
/* jshint camelcase: false */

module.exports = function(app) {

  var Comment = app.models.comment;
  var Click = app.models.click;
  var Notification = app.models.notif;
  var Stat = app.models.stat;
  var Base = app.models.base;

  var debug = app.debug('hooks:comment');

  /*
     Comment.observe('before save', function(ctx, next) {
//TODO It should make sure the comment has 
//a commentableType and id and username
console.log('Made it');
next();
});
*/

  Comment.afterRemote('prototype.__get__comments', function(ctx, instance,next){
    ctx.options = {
      clickType: 'getComments'
    };
    debug('aterRemote __get__comments', ctx, instance, next);
    Base.createClickAfterRemote(
      ctx,
      // istanbul ignore next
      function (err) {
        if(err) {
          console.error(err.stack);
        }
      }
    );
    next();
  });

  Comment.observe('after save', function(ctx, next) {
    debug('ater save', ctx, next);
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      Click.create({
        username: inst.username,
        type: 'createComment',
        clickableType: inst.commentableType,
        clickableId: inst.commentableId
      }, function(err, res) {
        if(err) {
          console.error('Error: Failed to create a click for comment creation');
        }
        next(err);
      });
    }
    else {
      if(!inst) {
        console.warn('Warning: Instance is not valid for comment after save');
      }
      next();
    }
  });


  /* istanbul ignore next */

  /*
  Comment.observe('after save', function(ctx, next) {
    debug('ater save', ctx, next);
    //TODO Rewrite notifications
    var inst = ctx.instance;

    //List of already notified users
    var users = [];

    var report = function(err,res) {
      if (err) console.error(err.stack);
      else {
        //console.log('Created a notification!');
      }
    };

    var notify = function(message, id, models) {
      var username;
      if(models) {
        if(Array.isArray(models)) {
          if(models.length ) {
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
        } else {
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
    };

    if (inst && ctx.isNewInstance) {

      users.push(inst.username);

      var Model = {};

      switch(inst.commentableType) {
        case 'article':
          //TODO original poster needs a notification
        Model = app.models.Subarticle;
        Model.find({
          where: {
            parentId: inst.commentableId
          }
        }, function(err, res) {
          if (err) {
            console.error(
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
            console.error(
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
            console.error(
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
            console.error(
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
          console.error('Error: bad votableType');
      }

    }
    next();

  });
  */

  Comment.triggerRating = function(where, modify, cb) {
    debug('triggerRating', where, modify, cb);
    if(where && Object.getOwnPropertyNames(where).length > 0) {
      Stat.updateRating(where, Comment.modelName, modify, function(err, res) {
        if(err) {
          console.warn('Warning: Failed to update a comment');
          cb(err);
        }
        else {
          var query = {
            where: where,
            limit: 1
          };

          Comment.find(query, function(err, res) {
            if(err) {
              console.warn('Warning: Failed to find comment');
              cb(err);
            }
            else if(res.length > 0) {
              Stat.triggerRating({
                id: res[0].commentableId
              }, res[0].commentableType, null, cb);
            }
            else {
              cb();
            }
          });
        }
      });
    } else {
      var error = new Error(
        'Invalid filter for comment.triggerRating: ' + where);
        error.status = 400;
        console.error(error.stack);
        cb(error);
    }
  };
};
