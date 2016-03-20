
/* jshint camelcase: false */

module.exports = function(app) {

  var Comment = app.models.comment;
  var Click = app.models.click;
  var Notification = app.models.notif;
  var Stat = app.models.stat;
  var Storage = app.models.storage;
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
    var dd = app.DD('Comment','afterGetComments');
    Base.createClickAfterRemote(
      ctx,
      // istanbul ignore next
      function (err) {
        dd.lap('Base.createClickAfterRemote');
        if(err) {
          console.error(err.stack);
        }
      }
    );
    next();
  });

  Comment.observe('after save', function(ctx, next) {
    var dd = app.DD('Comment','afterSave');
    debug('ater save', ctx, next);
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      Comment.notify(inst);
      Click.create({
        username: inst.username,
        type: 'createComment',
        clickableType: inst.commentableType,
        clickableId: inst.commentableId
      }, function(err, res) {
        dd.lap('Click.create');
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

  Comment.observe('before delete', function(ctx, next) {
    var dd = app.DD('Comment','beforeDelete');
    debug('before delete', ctx, next);
    Comment.find({ where: ctx.where }, function (err, res) {
      dd.lap('Comment.find');
      if(err) {
        console.error(err.stack);
        next(err);
      } else if(res.length > 0) {
        res.forEach(function(inst) {
          Storage.archive(inst, function(err) {
            dd.elapsed('Storage.archive');
            if(err) {
              console.error(err.stack);
              return next(err);
            } 

            inst.comments.destroyAll(function (err, res) {
              if(err) {
                console.error(err.stack);
                return next(err);
              }
              dd.elapsed('Comment.comments.destroyAll');

              var id = ctx.where.id || ctx.where._id;
              // Rerank the parent if this element was deleted individually 
              if(JSON.stringify(id) === JSON.stringify(inst.id)) {
                inst.commentable(function (err, res) {
                  dd.elapsed('Comment.commentable');
                  var data = {
                    $inc: {
                      'createCommentCount': -1
                    }
                  };

                  var modelName = inst.commentableType.charAt(0).toUpperCase() + inst.commentableType.slice(1);

                  res.updateAttributes(data, function (err, res) {
                    dd.elapsed(modelName + '.updateAttributes');
                    if(err) {
                      console.error(err.stack);
                      return next(err);
                    }
                    Base.deferUpdate(inst.commentableId, inst.commentableType, {
                      comment: true,
                    }, function(err) {
                      dd.elapsed('base.deferUpdate');
                      if(err) {
                        console.log(err.stack);
                      }
                      next(err);
                    });
                  });
                });
              } else {
                next();
              }
            });
          });
        });
      } else {
        next();
      }
    });
  });
  /* istanbul ignore next */

  /*
   * Unused due to deferred updates
  Comment.triggerRating = function(where, modify, cb) {
    var timer = app.Timer('Comment.triggerRating');
    debug('triggerRating', where, modify, cb);
    if(where && Object.getOwnPropertyNames(where).length > 0) {
      Stat.updateRating(where, Comment.modelName, modify, function(err, res) {
        timer.lap('Comment.triggerRating.updateRating');
        if(err) {
          console.warn('Warning: Failed to update a comment');
          cb(err);
        } else {
          var query = {
            where: where,
            limit: 1
          };

          Comment.find(query, function(err, res) {
            timer.lap('Comment.triggerRating.find');
            if(err) {
              console.warn('Warning: Failed to find comment');
              cb(err);
            } else if(res.length > 0) {
              Stat.triggerRating({
                id: res[0].commentableId
              }, res[0].commentableType, null, function(err, res) {
                timer.lap('Comment.triggerRating.triggerRating');
                cb(err, res);
              });
            } else {
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
 */
};
