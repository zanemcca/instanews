
/* jshint camelcase: false */

module.exports = function(app) {

  var Stat = app.models.Stat;
  var Base = app.models.Base;
  var debug = app.debug('hooks:stat');

  var secondsAgo =  function(seconds) {
    var now = (new Date()).getTime();
    var secondsAgo = new Date(now - seconds*1000);
    return secondsAgo;
  };

  /*
     Stat.updateRating = function(where, type, modify, cb) {
     debug('updateRating', where, type, modify, cb);
     if(!where || !type) {
     var err = new Error(
     'Error: Either id or type is missing for Stat.updateRating. Id: ' +
     where + ' Type: ' + type);
     err.status = 400;
     cb(err);
     return;
     }

     Stat.findById(Stat.averageId, function(err, res) {
     if(err) {
     console.error('Error: Failed to find ' + Stat.averageId);
     cb(err);
     } else {
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
err.status = 400;
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
    //delete where.ratingModified;

    if(err && (!err.status || err.status !== 409)) {
    console.error('Error: Failed to modify '+ Model.modelName);
    return cb(err);
    } else {
    if(!cb) {
    console.trace('Bad Callback');
    }
    cb(null, res);
    }
    }, {
customVersionName: 'ratingVersion',
retryCount: 0
});
}
else {
  err = new Error(Stat.averageId + ' was not found!');
  err.status = 404;
  cb(err);
}
}
});
};
*/

  Stat.updateRating = function(where, type, modify, cb) {
    debug('updateRating', where, type, modify, cb);
    var err;
    if(!where || !type) {
      err = new Error(
        'Error: Either id or type is missing for Stat.updateRating. Id: ' +
          where + ' Type: ' + type);
        err.status = 400;
        cb(err);
        return;
    }

    var Model;

    var secsAgo = secondsAgo(1);
    //Ratings can only be updated once every second
    /*
       where.ratingModified = {
lt: secsAgo 
};
*/

    var query = {
      where: where, 
      options: {
        rate: true
      },
      include: []
    };

    var whitelist = ['article', 'subarticle', 'comment'];
    var parentless = ['article'];
    if(whitelist.indexOf(type) > -1 && app.models[type]) {
      Model = app.models[type];
    }
    else {
      err = new Error('Error: Unrecognized type ' + type);
      err.status = 400;
      cb(err);
      return;
    }

    var stats = [];
    var rate = function(modify) {
      return function(model) {
        if( typeof(modify) === 'function') {
          model = modify(model);
        }
        var rating = Stat.getRating(model);

        if(parentless.indexOf(type) === -1) {
          var stat = {
            id: model.id,
            //TODO divide by zero protection
            deltaRating: (1- rating)/(1 - model.rating)
          };
          stats.push(stat);
        }

        model.rating = rating;
        model.ratingModified = new Date();
        return model;
      };
    };

    //console.log(query);
    Model.readModifyWrite(query, rate(modify), function(err, res) {
      //delete where.ratingModified;

      if(err && (!err.status || err.status !== 409)) {
        console.error('Error: Failed to modify '+ Model.modelName);
        return cb(err);
      } else {
        if(!cb) {
          console.trace('Bad Callback');
        }

        /*
           query.where.ratingModified = {
gt: secsAgo
};
*/
        Model.find(query, function (err, res) {
          if(err) {
            console.error(err.stack);
            return cb(err);
          }
          var finalResult = [];

          //Reduce stats so that there is at most one stat per
          //model. Then add parent information to each stat
          //Also ensure that the stat is valid by checking 
          var semiReducedStats = [];
          var completed = false;
          for(var i = 0; i < stats.length ; i++) {
            completed = false;
            for(var j in semiReducedStats) {
              if(semiReducedStats[j].id === stats[i].id) { 
                semiReducedStats[j].deltaRating *= delta;
                completed = true;
                break;
              }
            }
            if(!completed) {
              for(var k = 0; k < res.length; k++) {
                var model = res[k].toObject();
                if(model.id.equals(stats[i].id)) {
                  //Add only the results that were actually updated to the final resutlts
                  finalResult.push(model);

                  //Set the parent that the stat will be applied to
                  var stat = stats[i];
                  if(model.modelName === 'comment') {
                    stat.parentId  = model.commentableId;
                    stat.parentType = model.commentableType;
                  } else if(model.modelName === 'subarticle') {
                    stat.parentId  = model.parentId;
                    stat.parentType = 'article';
                  }

                  semiReducedStats.push(stat);
                  break;
                }
              }
            }
          }

          //Reduce the stats so that there is only one stat per unique
          //parent that requires updating
          var reducedStats = [];
          for(var m = 0; m < semiReducedStats.length; m++) {
            var semi =  semiReducedStats[m];
            completed = false;

            for(var l = 0; l < reducedStats.length; l++) {
              if(reducedStats[l].parentId === semi.parentId &&
                 reducedStats[l].parentType === semi.parentType) {
                reducedStats[l].deltaRating *= semi.deltaRating;
              completed = true;
              break;
              }
            }
            if(!completed) {
              reducedStats.push(semi);
            }
          }

          // Update attributes on all reduced stat parent Models
          reducedStats.forEach( function(stat) {
            var Model;
            if(whitelist.indexOf(stat.parentType) > -1) {
              var mul = {};
              if(type === 'comment') {
                mul = {
                  notCommentRating: stat.deltaRating
                };
              } else {
                mul = {
                  notSubarticleRating: stat.deltaRating
                };
              }

              Base.updateStats(stat.parentId, stat.parentType, {
                '$mul': mul
              }, function(err) {
                if(err) {
                  console.warn('Failed to update stat ' +stat.deltaRating +
                               ' on ' + stat.parentType + ' ' + stat.parentId);
                  console.warn(err);
                }
              });
            } else {
              console.warn(stat.parentType + ' is not a valid rateable model');
            }
          });

          //No need to wait around for all that to finish
          cb(null, finalResult);
        });
      }
    }, {
      customVersionName: 'ratingVersion',
      retryCount: 0
    });
  };

  Stat.triggerRating = function(where, modelName, modify, cb) {
    debug('triggerRating', where, modelName, modify, cb);
    var error = new Error('Unrecognized modelName: ' + modelName);
    error.status = 400;
    if(!app.models.hasOwnProperty(modelName)) {
      console.error(error.stack);
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
          error.status = 400;
          console.error(error.stack);
          cb(error);
      }
    }
  };
};
