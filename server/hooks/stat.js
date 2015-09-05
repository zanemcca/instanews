module.exports = function(app) {

  var Stat = app.models.Stat;
  var loopback = require('loopback');

  var secondsAgo =  function(seconds) {
    var now = (new Date()).getTime();
    var secondsAgo = new Date(now - seconds*1000);
    return secondsAgo;
  };


   //TODO Periodically update the stats object for averageJoe 

  Stat.updateRating = function(where, type, modify, cb) {
    if(!where || !type) {
      var message =
        'Error: Either id or type is missing for Stat.updateRating. Id: ' +
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

          //Ratings can only be updated once every ten seconds
          where.ratingModified = {
            lt: secondsAgo(10)
          };

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
              res = Stat.getRating(res, stats);
              res.ratingModified = new Date();
              return res;
            };
          };

          query.include.push({
            relation: 'comments',
            scope: {
              limit: res.comment.views.mean,
              order: 'rating DESC'
            } 
          });

          var stats = Stat.convertRawStats(Model, res);

          //console.log(query);
          Model.readModifyWrite(query, rate(modify, stats), function(err, res) {
            delete where.ratingModified;

            if(err) {
              console.log('Error: Failed to modify '+ Model.modelName);
              console.log(err);
              cb(err, res);
            }
            cb(null, res);
          }, {
            customVersionName: 'ratingVersion',
            retryCount: 0
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

  Stat.triggerRating = function(where, modelName, modify, cb) {
    var message;
    if(!app.models.hasOwnProperty(modelName)) {
      message = 'Unrecognized modelName: ' + modelName;
      console.log('Warning: ' + message);
      cb(new Error(message));
    }
    else {
      var Model = app.models[modelName];
      if(Model.triggerRating) {
        Model.triggerRating(where, modify, cb);
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
