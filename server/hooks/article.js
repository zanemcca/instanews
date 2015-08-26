
var loopback = require('loopback');
module.exports = function(app) {

   var Article = app.models.Article;
   var Stat = app.models.Stat;

  Article.observe('access', function(ctx, next) {
    ctx.options.rate = ctx.query.rate;
    if(ctx.query.rate) {
      var context = loopback.getCurrentContext();
      if(context) {
        var stat = context.get('currentStat');
        if(stat) {
          ctx.query.include = [{      
            relation: 'subarticles',
            scope: {
              limit: stat.subarticle.views.mean,
              order: 'rating DESC'
            } 
          },
          {
            relation: 'comments',
            scope: {
              limit: stat.comment.views.mean,
              order: 'rating DESC'
            } 
          }];
        }
      }
    }

    next();
  });

   Article.observe('loaded', function(res, next) {
     var instance = res.instance;
     if(!instance) {
       instance = res.data;
     }
     if(instance && res.options.rate) {
       Article.getCustomRating(instance, function(err, inst) {
        if(err) {
          console.log('Error: Failed to getCustomRating for article ' +
                      res.instance.id);
          console.log(err);
          next(err);
        }
        else {
          res.instance = inst;
          next();
        }
       });
     }
     else {
       next();
     }
   });

   Article.observe('before save', function(ctx, next) {
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         inst.modelName = 'article';
      }

      next();
   });

   //TODO before create - initialize its rating

   Article.getCustomRating = function(instance, cb) {
     //TODO Check if rating for instance is in cache first
    var ctx = loopback.getCurrentContext();
    if(ctx) {
      var stat = ctx.get('currentStat');

      if(stat) {
        var inst = Stat.getRating(instance, convertRawStats(stat));
        cb(null, inst);
      }
      else {
        console.log('Warning: Could not find stat object for user.' +
                    'Using global rank instead.');
        cb(null, instance);
      }
    }
   };

  var convertRawStats = function(raw, staticChange) {
    var commentView;
    var subView = Stat.getGeometricStats(raw.subarticle.views);
    var ageQ = Stat.getAgeQFunction(raw.article.age);

    if(staticChange) {
      commentView = Stat.getGeometricStats(raw.comment.views);
    }

    var total = raw.subarticle.age.count +
                raw.comment.age.count +
                raw.upVote.age.count;

    var stats = {
      age: ageQ,
      views: {
        comment: commentView,
        subarticle: subView
      },
      Pcomments: raw.comment.age.count/total,
      Psubarticles: raw.subarticle.age.count/total,
      Pvotes: raw.upVote.age.count/total
    };

    return stats;
  };

  Article.updateRating = function(id, rawStats, rate, cb, staticChange) {
    var stats = convertRawStats(rawStats, staticChange);

    var query = {
      where: {
        id: id 
      },
      include: [{      
        relation: 'subarticles',
        scope: {
          limit: stats.views.subarticle.mean,
          order: 'rating DESC'
        } 
      }]
    };

    if(staticChange) {
      query.include.push({
        relation: 'comments',
        scope: {
          limit: stats.views.comment.mean,
          order: 'rating DESC'
        } 
      });
    }

    Article.readModifyWrite(query, rate(stats), function(err, res) {
      if(err) {
        console.log('Error: Failed to modify article');
        console.log(err);
        cb(err, res);
      }
      //TODO Tell all subarticles to rerank (do not block)
      cb(null, res);
    });
  };

};
