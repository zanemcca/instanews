var common = require('./common');

module.exports = function(Stat) {

  Stat.averageId = 'averageJoe';

  Stat.on('dataSourceAttached', function(obj) {
     Stat.find({
       where: {
         id: Stat.averageId 
       }
     }, function(err, res) {
       if(err) {
         console.log('Error: Failed to load ' + Stat.averageId +
                     ': ' + JSON.stringify(err));
       }
       if(res.length === 0) {
         //Create the average user
         var hour = 60*60*1000;
         var day = hour*24;
         var average = {
           id: Stat.averageId,
           version: 0,
           //Represents the distribution of the age of an article and the users
           //given interest at that age
           //Includes voting on or creating subcontent on that content
           subarticle: {
             age: {
               mean: 2*day,
               variance: 13*hour*13*hour,
               count: 3000 
             },
             views: {
               mean: 20,
               variance: 1,
               count: 5000 
             }
           },
           comment: {
             age: {
               mean: 20*hour,
               variance: hour*hour,
               count: 3000
             },
             views: {
               mean: 20,
               variance: 1,
               count: 5000 
             }
           },
           upVote: {
             age: {
               mean: day,
               variance: 5*hour*5*hour,
               count: 10000 
             }
           },
           article: {
             age: {
               mean: day,
               variance: 10*hour*10*hour,
               count: 4000 
             },
             views: {
               mean: 20,
               variance: 1,
               count: 5000
             }
           }
         };

         //TODO We need to disable averageId as a value for a username
         Stat.create(average, function(err, res) {
           if(err) {
             console.log('Error: Failed to create '+ Stat.averageID +
                         ': ' + JSON.stringify(err));
             process.Exit(1);
           }
           console.log('Created ' + Stat.averageId);
         });
       }
       else {
         console.log(Stat.averageId + ' already exists');
       }
     });
  });

  Stat.getGeometricStats = function(stats) {
    //We want 99% of the rating to come from the first stats.mean number of 
    // items
    var percentIgnored = 0.01;
    return {
      mean: stats.mean,
      decay: Math.pow(percentIgnored, 1/stats.mean) 
    };
  };

  Stat.getAgeQFunction = function(stats) {
    var normalization  = (1 - common.math.cdf(0, stats.mean, stats.variance));
    var q = function(stats, norm) {
      return function(age) {
        var res = (1 - common.math.cdf(age, stats.mean, stats.variance))/norm;
        /*
        console.log(
          'Age: ' + age +
          '  Decay: ' + res
        );
       */
        return res;
      };
    };
    return q(stats, normalization);
  };

  Stat.getRating = function(res, stats) {
    var ppi = 0;

    var total = 0;
    //Votes
    if(stats.Pvotes) {
      total += stats.Pvotes;
      if(res.upVoteCount > res.views) {
        console.log('Error: There are more upVotes then views');
        return res;
      }
      ppi += stats.Pvotes * (res.upVoteCount / res.views);
    }
    else {
      console.log('Warning: getRating has been called without Pvotes');
      console.log(stats);
    }

    if(res.__cachedRelations) {
      //Comments
      if(stats.Pcomments) {
        total += stats.Pcomments;
        if(res.__cachedRelations.comments && stats.views.comment) {
          res.Pcomment = common.math.geometricDecay(
            res.__cachedRelations.comments,
            stats.views.comment.decay
          ); 
        }
        if(res.Pcomment === undefined) {
          res.Pcomment = 0;
        }
  //      console.log('Pcomment: ' + res.Pcomment);
        ppi += stats.Pcomments * res.Pcomment;
      }

      res.staticRating = ppi;

      //Subarticles 
      //TODO add the static subarticles too for the static rating
      if(stats.Psubarticles) {
        total += stats.Psubarticles;
        if(res.__cachedRelations.subarticles && stats.views.subarticle) {
          ppi += stats.Psubarticles * common.math.geometricDecay(
            res.__cachedRelations.subarticles,
            stats.views.subarticle.decay
          );
        }
      }
    }
    else {
      console.log('Warning: There were no comments or subarticles' +
                  ' attached to the article being ranked');
    }

    if( total > 1 || total < 0.999999) {
      console.log('Error: The probability of interest in all children ' +
                  total + ' does not equal 1');
      console.log(stats);
    }
    if( ppi > 1 || ppi < 0) {
      console.log('Error: The static probability is not unitary!: ' + ppi);
      return res;
    }

    // Click Thru
    if(res.clicks && res.views) {
      var clickThru  = res.clicks/res.views;
//      console.log('Click-Thru Ratio: ' + clickThru);
      ppi *= clickThru;
    }

    // User affinity
    // TODO

    var rnd = function(num, precision) {
      var scale = Math.pow(10,precision);
      return Math.round(num * scale)/scale;
    };
    //Time Decay
    if(stats.age) {
      var timeDecay =  stats.age(Date.now() - res.date);
      console.log(
        'Score: ' + rnd((ppi*timeDecay),4) +
        '\tStatic: ' + rnd(ppi,4) + 
        '\tPc: ' + rnd(stats.Pcomments,3) +
        '\tPs: ' + rnd(stats.Psubarticles,3) +
        '\tPv: ' + rnd(stats.Pvotes,3) +
        '\tDecay: ' + rnd(timeDecay,3));
      ppi *= timeDecay;
    }

    if( ppi > 1 || ppi < 0) {
      console.log('Error: The probability is not unitary!: ' + ppi);
      return res;
    }

    res.rating = ppi;
    return res;
  };

   Stat.addSample = function(id, modelName, statName , value, cb) {
     if(!id) {
       var message = 'An invalid id was given for sample updating!';
       console.log('Error: ' + message);
       cb(new Error(message));
       return;
     }

     var modify = function(inst) {
       var res = inst;
       var model = res[modelName];
       if(!model) {
         console.log('Warning: No stat found for "' + modelName +'"');
         model = {};
       }
       var stat = model[statName];
       if(!stat) {
         console.log('Warning: No stat found for "' + modelName +
                     '.' + statName + '"');
         stat = {
           mean: 0,
           count: 0
         };
       }

       stat.count++;
       var delta = value - stat.mean;
       stat.mean += delta/stat.count;
       if( stat.count >= 2) {
         if(!stat.variance) {
           stat.variance = 0;
         }
         stat.variance *= (stat.count - 2);
         stat.variance += delta*(value - stat.mean);
         stat.variance /= (stat.count - 1); 
       }

       model[statName] = stat;
       res[modelName] = model;

       return res;
     };

     common.readModifyWrite(
       Stat,
       {
         where: {
           id: id
         }
       }, 
       modify,
       function(err, res) {
         if(err) {
           console.log('Error: Failed to add sample to stat object: ' + id);
           console.log(err);
         }
         if(res !== 1) {
           console.log(
             'Warning: More than one stat object was updated for id: ' + id);
         }
         cb(err, res);
       }
     );
   };
};
