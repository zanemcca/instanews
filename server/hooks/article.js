
var loopback = require('loopback');
module.exports = function(app) {

   var Article = app.models.Article;
   var Subarticle = app.models.Subarticle;
   var Stat = app.models.Stat;

  Article.observe('access', function(ctx, next) {
    if(ctx.options.rate) {
      var context = loopback.getCurrentContext();
      if(context) {
        var stat = context.get('currentStat');
        if(stat) {
          if(ctx.query.include) {
            if(typeof(ctx.query.include) === 'object') {
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
              rate: true,
              order: 'rating DESC'
            } 
          });
        }
      }
    }
    next();
  });

  var minutesAgo =  function(minutes) {
    var now = (new Date()).getTime();
    var minutesAgo = new Date(now - minutes*60000);
    return minutesAgo;
  };

  Article.triggerRating = function(where, modify, cb, staticChange) {
    if(where.id) {
      Stat.updateRating({
        parentId: where.id,
        modified: {
          lt: minutesAgo(5)
        }
      }, Subarticle.modelName, null, function(err, res) {
        Stat.updateRating(where, Article.modelName, modify, function(err, res) {
          if(err) {
            console.log('Warning: Failed to update an article');
          }
          cb(err, res);
        }, staticChange);
      }, false);
    }
    else {
      var message = 'Invalid filter for article.triggerRating: ' + where;
      console.log('Warning: ' + message);
      cb(new Error(message));
    }
  };
};
