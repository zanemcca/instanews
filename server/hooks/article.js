
var loopback = require('loopback');
module.exports = function(app) {

   var Article = app.models.Article;
   var Stat = app.models.Stat;

   Article.observe('loaded', function(res, next) {
    var ctx = loopback.getCurrentContext();
    if(ctx) {
      var user = ctx.get('currentUser');
      //TODO Rank the users articles for them 
      //TODO Check if ranking are in cache first
    }
    next();
   });

   Article.observe('before save', function(ctx, next) {
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         inst.modelName = 'article';
      }

      next();
   });

   //TODO before create - initialize its rating

  Article.updateRating = function(id, rawStats, rate, cb, staticChange) {
    var commentView;
    var subView = Stat.getGeometricStats(rawStats.subarticle.views);
    var ageQ = Stat.getAgeQFunction(rawStats.article.age);

    var query = {
      where: {
        id: id 
      },
      include: [{      
        relation: 'subarticles',
        scope: {
          limit: subView.mean,
          order: 'rating DESC'
        } 
      }]
    }

    if(staticChange) {
      commentView = Stat.getGeometricStats(rawStats.comment.views);
      query.include.push({
        relation: 'comments',
        scope: {
          limit: commentView.mean,
          order: 'rating DESC'
        } 
      });
    }

    var total = rawStats.subarticle.age.count +
                rawStats.comment.age.count +
                rawStats.upVote.age.count;

    var stats = {
      age: ageQ,
      views: {
        comment: commentView,
        subarticle: subView
      },
      Pcomments: rawStats.comment.age.count/total,
      Psubarticles: rawStats.subarticle.age.count/total,
      Pvotes: rawStats.upVote.age.count/total
    };

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
