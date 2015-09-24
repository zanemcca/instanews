

/* jshint camelcase: false */

var loopback = require('loopback');
module.exports = function(app) {

   var Article = app.models.Article;
   var Base = app.models.base;
   var View = app.models.view;
   var Subarticle = app.models.Subarticle;
   var Stat = app.models.Stat;

  Article.afterRemote('prototype.__get__comments', function(ctx, instance,next){
    Base.createClickAfterRemote(ctx, next);
  });

  Article.afterRemote('prototype.__get__subarticles', function(ctx, inst, next){
    Base.createClickAfterRemote(ctx, next);
  });

  Article.observe('after save', function(ctx, next) {
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      View.create({
        username: inst.username,
        viewableType: 'article',
        viewableId: inst.id
      }, function(err, res) {
        if(err) {
          console.log(
            'Error: Failed to create a view for article creation');
        }
        next(err);
      });
    }
    else {
      if(!inst) {
        console.log('Warning: Instance is not valid for article after save');
      }
      next();
    }
  });

  Article.observe('access', function(ctx, next) {
    if(ctx.options.rate) {
      var context = loopback.getCurrentContext();
      if(context) {
        var stat = context.get('currentStat');
        if(stat) {
          if(ctx.query.include) {
            if(!Array.isArray(ctx.query.include)) {
              ctx.query.include = [ctx.query.include];
            }
          }
          else {
            ctx.query.include = [];
          }

          ctx.query.include.push({      
            relation: 'subarticles',
            scope: {
              limit: stat.subarticle.views.mean,
              order: 'rating DESC'
            } 
          });
        }
      }
    }
    next();
  });

  Article.triggerRating = function(where, modify, cb) {
    if(where && where.id) {
      //Update the article
      Stat.updateRating(where, Article.modelName, modify, function(err, res) {
        if(err && err.status !== 409) {
          console.log('Warning: Failed to update an article');
          return cb(err);
        }
        cb(null, res);
      });
      /* without time decay we do not need to trigger the subarticles
      //Update the subarticles
      Stat.updateRating({
        parentId: where.id
      }, Subarticle.modelName, null, function(err, res) {
        //Update the article
        Stat.updateRating(where, Article.modelName, modify, function(err, res) {
          if(err) {
            console.log('Warning: Failed to update an article');
          }
          cb(err, res);
        });
      });
     */
    } else {
      var error = new Error(
        'Invalid filter for article.triggerRating: ' + where);
      console.log(error);
      error.status = 400;
      cb(error);
    }
  };
};
