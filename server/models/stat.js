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

  Stat.getRating = function(rateable, stats) {
    var upVoteBonus = 25;
    var clickBonus = 100;
    var viewBonus = 100;

    var upVoteCount, viewCount, clickCount;

    if(typeof(rateable.upVoteCount) === 'number' &&
     typeof(rateable.viewCount) === 'number' &&
     typeof(rateable.clickCount) === 'number'
    ) {
      upVoteCount = rateable.upVoteCount + upVoteBonus;
      viewCount = rateable.viewCount + viewBonus;
      clickCount = rateable.clickCount + clickBonus;
    }
    else {
      console.log('Error: Critical information is missing from the rateable model');
      console.log(rateable);
      return rateable;
    }

    var rating = 0;
    var commentRating;
    var staticRating;

    var total = 0;

    //Convert the result to an object if it is not already
    if(rateable.toObject !== undefined && typeof rateable.toObject === 'function') {
      rateable = rateable.toObject();
    }

    //Votes
    if(stats.Wvote) {
      total += stats.Wvote;
      if(upVoteCount > viewCount) {
        console.log('Error: There are more upVotes then views');
        return rateable;
      }
      rating += stats.Wvote * (upVoteCount / viewCount);
    }
    else {
      console.log('Warning: getRating has been called without Wvote');
      console.log(stats);
    }

    //Comments
    if(stats.Wcomment) {
      total += stats.Wcomment;
      if(rateable.comments && stats.views.comment) {
        commentRating = common.math.geometricDecay(
          rateable.comments,
          stats.views.comment.decay
        ); 
        rating += stats.Wcomment * commentRating;
      }
    }

    if( rateable.modelName !== 'comment') {
      staticRating = rating;
    }
    
    //Subarticles 
    if(stats.Wsubarticle) {
      total += stats.Wsubarticle;
      var subs = rateable.subarticles;
      if(subs && stats.views.subarticle) {
        rating += stats.Wsubarticle * common.math.geometricDecay(
          subs,
          stats.views.subarticle.decay
        );

        var staticRatings = [];
        for(var i = 0; i < subs.length; i++) {
          if(typeof(subs[i].staticRating) === 'number') {
            staticRatings.push(subs[i].staticRating);
          }
          else {
            console.log('Warning: The subarticle should have a ' +
                        'staticRating but it does not');
            staticRatings.push(subs[i].rating);
          }
        }

        staticRatings.sort(function(a, b){return b-a;});

        staticRating += stats.Wsubarticle * common.math.geometricDecay(
          staticRatings,
          stats.views.subarticle.decay
        );
      }
    }

    if( total > 1 || total < 0.999999999) {
      console.log('Error: The probability of interest in all children ' +
                  total + ' does not equal 1');
      console.log(stats);
    }
    if( rating > 1 || rating < 0) {
      console.log('Error: The static probability is not unitary!: ' + rating);
      return rateable;
    }

    // Click Thru
    //Q function of geometric distribution for #clicks > 0
    var clickThru  = clickCount/(clickCount + viewCount);
    rating *= clickThru;
    staticRating *= clickThru;

    // User affinity
    // TODO

    var rnd = function(num, precision) {
      var scale = Math.pow(10,precision);
      return Math.round(num * scale)/scale;
    };
    //Time Decay
    if(stats.age) {
      var timeDecay =  stats.age(Date.now() - rateable.created);
      rating *= timeDecay;
    }

    console.log(
      'Score: ' + rnd(rating,4) +
      '\tStatic: ' + rnd(staticRating,4) + 
      '\tTyp: ' + rateable.modelName +
      '\tWv: ' + rnd(stats.Wvote,3) +
      '\tWc: ' + rnd(stats.Wcomment,3) +
      '\tWs: ' + rnd(stats.Wsubarticle,3)
    );

    if( rating > 1 || rating < 0) {
      console.log('Error: The probability is not unitary!: ' + rating);
      return rateable;
    }

    rateable.staticRating = staticRating;
    rateable.rating = rating;
    return rateable;
  };

   Stat.addSample = function(where, modelName, statName , value, cb) {
     if(!where) {
       var message = 'An invalid where filter was given for sample updating!';
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
         where: where
       }, 
       modify,
       function(err, res) {
         if(err) {
           console.log('Error: Failed to add sample to stat object');
           console.log(err);
         }
         if(res > 1) {
           console.log(
             'Warning: More than one stat object was updated: ' + res);
         }
         else if(res === 0) {
           console.log(
             'Warning: No stat object was updated');
         }
         cb(err, res);
       }
     );
   };
};
