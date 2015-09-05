
module.exports = function(app) {

   var Subarticle = app.models.subarticle;
   var Click = app.models.click;
   var Article = app.models.Article;
   var Stat = app.models.stat;
   var Notification = app.models.notif;
  var Votes = app.models.votes;

  var secondsAgo =  function(seconds) {
    var now = (new Date()).getTime();
    var secondsAgo = new Date(now - seconds*1000);
    return secondsAgo;
  };

  Subarticle.afterRemote('prototype.__get__comments', function(ctx, inst,next){
    Votes.createClickAfterRemote(ctx, next);
  });

   Subarticle.observe('before save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst && ctx.isNewInstance) {
         inst.modelName = 'subarticle';
         if ( inst._file ) {
            if ( inst._file.type === 'video') {
               //console.log('Saving a video');
               if ( !inst._file.poster ) {
                  inst._file.poster = 'img/ionic.png';
               }
            }
            else {
               //console.log('Saving some other media type');
            }
         }
      }
      next();
   });

   //TODO before create - initialize its rating
  
  Subarticle.triggerRating = function(where, modify, cb) {
    Stat.updateRating(where, Subarticle.modelName, modify,
    function(err, count) {
      if(err) {
        console.log('Warning: Failed to update a subarticle');
        cb(err);
      }
      else {
        var query = {
          where: where,
          limit: 1
        };
        Subarticle.find(query, function(err, res) {
          if(err) {
            console.log('Warning: Failed to find subarticle');
            cb(err);
          }
          else if(res.length > 0) {
            Article.triggerRating({
              id: res[0].parentId
            }, null, function(err, res) {
              cb(err, count);
            }, false);
          }
          else {
            console.log('Warning: Failed to find subarticles.' +
                        ' Cannot trigger article rating');
            cb();
          }
        });
      }
    });
  };

  Subarticle.observe('after save', function(ctx, next) {
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      Click.create({
        username: inst.username,
        clickableType: 'article',
        clickableId: inst.parentId
      }, function(err, res) {
        if(err) {
          console.log(
            'Error: Failed to create a click for subarticle creation');
        }
        next(err);
      });
    }
    else {
      if(!inst) {
        console.log('Warning: Instance is not valid for subarticle after save');
      }
      next();
    }
  });

   Subarticle.observe('after save', function(ctx, next) {
     
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         //Find all subarticles associated with this article
         Subarticle.find({
            where: {
               parentId: inst.parentId
            }
         }, function(err, res) {
            //Error checking
            if(err) console.log(err);
            else {

               var report = function(err, res) {
                  if (err) console.log('Error: ' + err);
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
