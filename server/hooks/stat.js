
/* jshint camelcase: false */

module.exports = function(app) {

  var Stat = app.models.Stat;

  var secondsAgo =  function(seconds) {
    var now = (new Date()).getTime();
    var secondsAgo = new Date(now - seconds*1000);
    return secondsAgo;
  };

   //TODO Periodically update the stats object for averageJoe 

  Stat.updateRating = function(where, type, modify, cb) {
    if(!where || !type) {
      var err = new Error(
        'Error: Either id or type is missing for Stat.updateRating. Id: ' +
        where + ' Type: ' + type);
      err.http_code = 400;
      cb(err);
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
            lt: secondsAgo(1)
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
            err = new Error('Error: Unrecognized type ' + type);
            err.http_code = 400;
            cb(err);
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

            if(err && err.status !== 409) {
              console.log('Error: Failed to modify '+ Model.modelName);
              return cb(err);
            }
            cb(null, res);
          }, {
            customVersionName: 'ratingVersion',
            retryCount: 0
          });
        }
        else {
          err = new Error(Stat.averageId + ' was not found!');
          err.http_code = 404;
          cb(err);
        }
      }
    });
  };

  Stat.triggerRating = function(where, modelName, modify, cb) {
    var error = new Error('Unrecognized modelName: ' + modelName);
    error.http_code = 400;
    if(!app.models.hasOwnProperty(modelName)) {
      console.log(error);
      cb(error);
    }
    else {
      var Model = app.models[modelName];
      if(Model.triggerRating) {
        Model.triggerRating(where, modify, cb);
      }
      else {
        error = new Error(
          'No triggerRating function attached to the ' + modelName);
        error.http_code = 400;
        console.log(error);
        cb(error);
      }
    }
  };
};
