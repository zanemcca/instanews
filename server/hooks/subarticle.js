
/* jshint camelcase: false */

module.exports = function(app) {

   var Subarticle = app.models.subarticle;
   var File = app.models.file;
   var Click = app.models.click;
   var Article = app.models.Article;
   var Stat = app.models.stat;
   var Notification = app.models.notif;
  var Base = app.models.base;
  var debug = app.debug('hooks:subarticle');

  Subarticle.afterRemote('prototype.__get__comments', function(ctx, inst,next){
    ctx.options = {
      clickType: 'getComments'
    };
    debug('afterRemote __get__comments', ctx, inst, next);
    Base.createClickAfterRemote(ctx, next);
  });

   Subarticle.observe('before save', function(ctx, next) {
      debug('before save', ctx, next);
      var inst = ctx.instance;
      if (inst && ctx.isNewInstance) {
         if ( inst._file ) {
           File.beforeSave(inst._file, next);
         } else {
           next();
         }
      } else {
        next();
      }
   });

  Subarticle.triggerRating = function(where, modify, cb) {
    debug('triggerRating', where, modify, cb);
    if(where && Object.getOwnPropertyNames(where).length > 0) {
      Stat.updateRating(where, Subarticle.modelName, modify,
      function(err, count) {
        if(err) {
          console.warn('Warning: Failed to update a subarticle');
          cb(err);
        }
        else {
          var query = {
            where: where,
            limit: 1
          };
          Subarticle.find(query, function(err, res) {
            if(err) {
              console.warn('Warning: Failed to find subarticle');
              cb(err);
            }
            else if(res.length > 0) {
              Article.triggerRating({
                id: res[0].parentId
              }, null, function(err, res) {
                cb(err, count);
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
      console.error(error.stack);
      error.status = 400;
      cb(error);
    }
  };

  Subarticle.observe('after save', function(ctx, next) {
    debug('after save', ctx, next);
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      Click.create({
        username: inst.username,
        type: 'createSubarticle',
        clickableType: 'article',
        clickableId: inst.parentId
      }, function(err, res) {
        if(err) {
          console.error(
            'Error: Failed to create a click for subarticle creation');
        }
        next(err);
      });
    }
    else {
      if(!inst) {
        console.warn('Warning: Instance is not valid for subarticle after save');
      }
      next();
    }
  });

   Subarticle.observe('after save', function(ctx, next) {
    debug('after save', ctx, next);
     
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         //Find all subarticles associated with this article
         Subarticle.find({
            where: {
               parentId: inst.parentId
            }
         }, function(err, res) {
            //Error checking
            if(err) console.error(err.stack);
            else {

               var report = function(err, res) {
                  if (err) console.error(err.stack);
                  else {
                     //console.log('Created a notification!');
                  }
               };

               //List of already notified users
               var users = [
                  inst.username
               ];
               for( var  i = 0; i < res.length; i++) {
                  if ( users.indexOf(res[i].username) === -1) {
                     //Send a notification to each user
                     //associated with the parent article
                     var username = res[i].username;
                     var message = inst.username +
                        ' collaborated with you on an article';

                     Notification.create({
                        message: message,
                        notifiableId: inst.parentId,
                        notifiableType: 'article',
                        messageFrom: inst.username,
                        username: username
                     }, report);

                     users.push(res[i].username);
                  }
               }
            }
         });
      }
      next();
   });
};
