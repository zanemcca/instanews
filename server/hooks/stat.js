module.exports = function(app) {

  var Stat = app.models.Stat;
  var loopback = require('loopback');

   //TODO Periodically update the stats object for averageJoe 

   //StaticChange is a boolean that will cause non-timedecayed components
   // to be refreshed as well as the time decayed.
   // An example of its use would be if the rating of a comment on an 
  // article changed then we would want the article to update the 
  // contribution from comments as well
   // In that situation staticChange = true
  Stat.updateRating = function(where, type, modify, cb, staticChange) {
    if(!where || !type) {
      var message = 'Error: Either id or type is missing for Stat.updateRating. Id: ' +
        where + ' Type: ' + type;
      console.log(message);
      cb(new Error(message));
      return;
    }

    Stat.findById(Stat.averageId, function(err, res) {
      if(err) {
        console.log('Error: Failed to find ' + Stat.averageId);
        cb(err);
      }
      else {
        if(res) {
          var Model;
          var query = {
            where: where, 
            include: []
          };

          if(type === 'article') {
            Model = app.models.Article;
            query.include.push({
              relation: 'subarticles',
              scope: {
                limit: res.subarticle.views.mean,
                order: 'rating DESC'
              } 
            });
          }
          else if(type === 'subarticle') {
            Model = app.models.Subarticle;
          }
          else if(type === 'comment') {
            Model = app.models.Comment;
          }
          else {
            console.log('Error: Unrecognized type ' + type);
            cb(new Error('Unrecognized type ' + type));
            return;
          }

          var rate = function(mod, stats) {
            return function(res) {
              if( typeof(mod) === 'function') {
                res = mod(res);
              }
              return Stat.getRating(res, stats);
            };
          };

          if(staticChange) {
            query.include.push({
              relation: 'comments',
              scope: {
                limit: res.comment.views.mean,
                order: 'rating DESC'
              } 
            });
          }

          var stats = Stat.convertRawStats(Model, res);

          Model.readModifyWrite(query, rate(modify, stats), function(err, res) {
            if(err) {
              console.log('Error: Failed to modify '+ Model.modelName);
              console.log(err);
              cb(err, res);
            }
            cb(null, res);
          });
        }
        else {
          var message = Stat.averageId + ' was not found!';
          console.log('Error:' + message);
          cb(new Error(message));
        }
      }
    });
  };

  Stat.triggerRating = function(where, modelName, modify, cb, staticChange) {
    if(!app.models.hasOwnProperty(modelName)) {
      var message = 'Unrecognized modelName: ' + modelName;
      console.log('Warning: ' + message);
      cb(new Error(message));
    }
    else {
      var Model = app.models[modelName];
      if(Model.triggerRating) {
        Model.triggerRating(where, modify, cb, staticChange);
      }
      else {
        message = 'No triggerRating function attached to the model';
        console.log('Warning: ' + message);
        cb(new Error(message));
      }
    }
  };

   Stat.getCustomRating = function(Model, instance, cb) {
     //TODO Check if rating for instance is in cache first
    var ctx = loopback.getCurrentContext();
    if(ctx) {
      var stat = ctx.get('currentStat');

      if(stat) {
        var inst = Stat.getRating(instance, Stat.convertRawStats(Model, stat));
        cb(null, inst);
      }
      else {
        console.log('Warning: Could not find stat object for user.' +
                    'Using global rank instead.');
        cb(null, instance);
      }
    }
   };

  Stat.convertRawStats = function(Model, raw) {
    //All of the necessary parts of the raw statistics are converted into
    //the parameters needed to compute the rating of the votes instance

    var commentView, subView, ageQ, Wcomment, Wsubarticle, Wvote;

    var total = raw.comment.age.count + raw.upVote.age.count;

    if(Model.modelName === 'article') {
      total += raw.subarticle.age.count;
      Wsubarticle = raw.subarticle.age.count/total;

      subView = Stat.getGeometricStats(raw.subarticle.views);
      ageQ = Stat.getAgeQFunction(raw.article.age);
    }
    else if(Model.modelName === 'subarticle') {
      ageQ = Stat.getAgeQFunction(raw.subarticle.age);
    }

    Wcomment = raw.comment.age.count/total;
    Wvote =  raw.upVote.age.count/total;

    commentView = Stat.getGeometricStats(raw.comment.views);

    var stats = {
      age: ageQ,
      views: {
        comment: commentView,
        subarticle: subView
      },
      Wcomment: Wcomment,
      Wsubarticle: Wsubarticle,
      Wvote: Wvote 
    };

    return stats;
  };
};
