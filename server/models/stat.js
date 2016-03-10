
module.exports = function(Stat) {

  Stat.averageId = 'averageJoe';

  var debug = require('../logging').debug('models:stat');

  //TODO Create a probability and statistics library for javascript
  // Takes all arguments and calculates the 
  // union of the probability set
  Stat.getUnion = function () {
    var args = Array.prototype.slice.call(arguments);
    if(args.length > 0) {
      var res = args[0];
      if(typeof(res) !== 'number') {
        var arg;
        try {
          arg = Number(res);
        } // istanbul ignore next 
        catch(e) {
          console.warn('Cannot calculate union of non-numbers');
          return NaN;
        }
        res = arg;
      }

      if(res > 1 || res < 0) {
        console.warn('Cannot calculate union of non-normalized values: ' + res);
        return NaN;
      } 

      if(args.length > 1) {
        var subArgs = args.slice(1);
        var subUnion = Stat.getUnion.apply(Stat, subArgs);
        return subUnion + res*(1-subUnion);
      } // istanbul ignore else 
      else if(args.length === 1) {
        return res;
      }
    } else {
      console.warn('There were no arguments given for getUnion');
      return 0;
    }
  };

  Stat.getIntersection = function () {
    var args = Array.prototype.slice.call(arguments);
    if(args.length > 0) {
      var res = args[0];
      if(typeof(res) !== 'number') {
        var arg;
        try {
          arg = Number(res);
        } // istanbul ignore next 
        catch(e) {
          console.warn('Cannot calculate union of non-numbers');
          return NaN;
        }
        res = arg;
      }

      if(res > 1 || res < 0) {
        console.warn('Cannot calculate union of non-normalized values: ' + res);
        return NaN;
      } 

      if(args.length > 1) {
        var subArgs = args.slice(1);
        var subRes = Stat.getIntersection.apply(Stat, subArgs);
        return res*subRes;
      } // istanbul ignore else 
      else if(args.length === 1) {
        return res;
      }
    } else {
      console.warn('There were no arguments given for getUnion');
      return 0;
    }
  };

  /*
     Stat.bonus = {
upVoteCount: 10,
downVoteCount: 3,
getCommentsCount: 8,
getSubarticlesCount: 30,
createSubarticleCount: 1,
createCommentCount: 2,
viewCount: 270
};

*/
  // up + down <= viewCount
  Stat.bonus = {
    upVoteCount: 1,
    downVoteCount: 0,
    getCommentsCount: 1,
    getSubarticlesCount: 1,
    createSubarticleCount: 0,
    createCommentCount: 0,
    viewCount: 1 
  };

  Stat.weight = {
    upVotes: 1,
    downVotes: 1,
    subarticles: 0.7, 
    comments: 0.7
  };

  // Critical values from the t table for 
  // 50% Confidence Interval
  var tTable = [
    1,
    0.816,
    0.765,
    0.741,
    0.727,
    0.718,
    0.711,
    0.706,
    0.703,
    0.700,
    0.697,
    0.695,
    0.694,
    0.692,
    0.691,
    0.690,
    0.689,
    0.688,
    0.688,
    0.687,
    0.687,
    0.686,
    0.686,
    0.685,
    0.685,
    0.684,
    0.684,
    0.684,
    0.683,
    0.683,
    0.683,
    0.681,
    0.679,
    0.679,
    0.678,
    0.677
  ];

  var criticalValueInfinity = 0.674;

  Stat.getRating  = function(rateable) {
    Stat.app.dd.increment('Stat.getRating');
    var upVoteCount = rateable.upVoteCount || 0;
    var downVoteCount = rateable.downVoteCount || 0;
    var getCommentsCount = rateable.getCommentsCount || 0;
    var getSubarticlesCount = rateable.getSubarticlesCount || 0;
    var viewCount = rateable.viewCount + 1;

    var PnotCom = rateable.notCommentRating || 1;
    var PnotSub = rateable.notSubarticleRating || 1;
    if(typeof(rateable.notCommentRating) === 'number') {
      PnotCom = rateable.notCommentRating;
    }

    if(typeof(rateable.notSubarticleRating) === 'number') {
      PnotSub = rateable.notSubarticleRating;
    }

    if(upVoteCount >= viewCount) {
      console.warn('Upvote count is too high for ' + rateable.modelName + ': ' + rateable.id + '! Rating broken!');
      return 0.0001;
    }
    if(downVoteCount >= viewCount) {
      console.warn('Downvote count is too high for ' + rateable.modelName + ': ' + rateable.id + '! Rating broken!');
      return 0.0001;
    }

    /*
    // istanbul ignore else
    if(typeof(rateable.upVoteCount) === 'number') {
    upVoteCount += rateable.upVoteCount;
    }
    // istanbul ignore else
    if(typeof(rateable.downVoteCount) === 'number') {
    downVoteCount += rateable.downVoteCount;
    }

    if(typeof(rateable.viewCount) === 'number') {
    viewCount += rateable.viewCount;
    } else {
    console.error('Rateable item does not have a viewCount!');
    }
    */

    var viewCountBonus = viewCount + Stat.bonus.viewCount;

    // Calculate the critical value from the df and tTable
    var degreesOfFreedom = viewCountBonus - 1;
    var criticalValue;
    if(!degreesOfFreedom || degreesOfFreedom < 0) {
      criticalValue = 1;
    } else if(degreesOfFreedom < tTable.length) {
      criticalValue = tTable[degreesOfFreedom - 1];
    } else {
      criticalValue = criticalValueInfinity;
    }

    var clickCount =
      upVoteCount +
      downVoteCount; 

    var Pcom = 0;

    clickCount += getCommentsCount;
    Pcom = (1 - PnotCom);
    Pcom *= Stat.weight.comments;

    // P(click & comment interaction)
    // Q function of geometric distribution for P(getCommentsCount > 0)
    var PgetComs = (getCommentsCount/(getCommentsCount + viewCount));

    // Biased Margninal Error = Critical Value * stddev/sqrt(n)
    var PgetComsBonus = getCommentsCount + Stat.bonus.getCommentsCount;
    PgetComsBonus /= (PgetComsBonus + viewCountBonus);

    // The variance on the geometric series can grow indefinitely which can result in massive bonuses
    // so to avoid exploitation we are going to use the approximation of the bernoulli stderr
    var PgetComsErrorBonus = criticalValue * Math.sqrt(PgetComsBonus*(1-PgetComsBonus)/viewCountBonus);

    PgetComs += PgetComsErrorBonus;

    Pcom *= PgetComs;

    var Psub = 0;
    if(rateable.modelName === 'article') {
      clickCount += getSubarticlesCount;
      Psub = (1 - PnotSub);
      Psub *= Stat.weight.subarticles;

      // P(click & subarticle interaction)
      /*
       * The Bernoulli distribution is to easily broken by a getSubarticlesCount > viewCount
       * so I am using a geometric distribution instead. Also views are not recreated when you go back
       * and forth from the feed and articles so it is geometric in nature anyway
       *
      // Bernoulli distribution
      var PgetSubs = (getSubarticlesCount/viewCount);
      // Biased Margninal Error = Critical Value * stddev/sqrt(n)
      var PgetSubsBonus = getSubarticlesCount + Stat.bonus.getSubarticlesCount;
      PgetSubsBonus /= viewCountBonus;
      console.log(PgetSubBonus);
      */

      // Q function of geometric distribution for P(clicking on article > 0 times in a view)
      var PgetSubs = (getSubarticlesCount/(getSubarticlesCount + viewCount));
      // Biased Margninal Error = Critical Value * stddev/sqrt(n)
      var PgetSubsBonus = getSubarticlesCount + Stat.bonus.getSubarticlesCount;
      PgetSubsBonus /= (PgetSubsBonus + viewCountBonus);

      // The variance on the geometric series can grow indefinitely which can result in massive bonuses
      var PgetSubsErrorBonus = criticalValue * Math.sqrt(PgetSubsBonus*(1-PgetSubsBonus)/viewCountBonus);

      PgetSubs += PgetSubsErrorBonus;
      Psub *= PgetSubs;
    }

    debug(
      'id: ' + rateable.id +
        '\tType: ' + rateable.modelName +
        '\tCv: ' + criticalValue +
        '\tViews: ' + viewCount +
        '\tUp: ' + upVoteCount + 
        '\tDown: ' + downVoteCount +
        '\tgetComs: ' + getCommentsCount +
        '\tgetSubs: ' + getSubarticlesCount +
        '\tPnotCom: ' + rateable.notCommentRating +
        '\tPnotSub: ' + rateable.notSubarticleRating
    );


    var Pup = upVoteCount/viewCount;

    var PupBonus = upVoteCount + Stat.bonus.upVoteCount;
    PupBonus /= viewCountBonus;
    var PupErrorBonus = criticalValue * Math.sqrt(PupBonus*(1-PupBonus)/viewCountBonus); // The add the margin error (CV * stderr)
    Pup += PupErrorBonus;
    Pup = Stat.weight.upVotes * Pup;

    var Pdown = Stat.weight.downVotes * downVoteCount/viewCount;

    var Pclick = Stat.getUnion(Pcom, Psub);
    //rating = Stat.getUnion(Pup, Pclick) - Stat.getIntersection(Pclick, Pdown);

    // The rating is the probability of not downvoting and then positively interacting
    rating = (1 - Pdown)*(Pup + (1 - Pdown - Pup)*Pclick);

    /*
    // Click Thru
    //Q function of geometric distribution for #clicks > 0
    var clickThru  = clickCount/(clickCount + viewCount);
    rating *= clickThru;
    */

    /*
       console.log('id: ' + rateable.id + '\tviews: ' + viewCount + '\tclicks: ' + clickCount + '\tthru: ' + clickThru);
       */
    debug(
      'Rating: ' + rating +
        '\tDiff: ' + (rating - rateable.rating) +
        '\tPclick: ' + Pclick +
        '\tPup: ' + Pup +
        '\tPdown: ' + Pdown + 
        '\tPcom: ' + Pcom +
        '\tPsub: ' + Psub
    );


    if(rating > 1 || rating < 0 || isNaN(rating)) {
      console.warn('The returned probability is not unitary!: ' + rating);
      return rateable.rating;
    }

    if(rating === 1) {
      rating = 0.9999; 
    }
    if(rating === 0) {
      rating = 0.0001;
    }

    return rating;
  }; 

  Stat.getDefaultRating = function (modelName) {
    console.log('Getting default rating!');
    var model = {
      modelName: modelName,
      upVoteCount: 0,
      downVoteCount: 0,
      viewCount: 0 
    };

    return Stat.getRating(model);
  };

  Stat.getCustomRating = function(Model, instance, cb) {
    //TODO Check if rating for instance is in cache first

    var inst = Stat.getRating(instance);
    cb(null, inst);
  };

  /*
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

Stat.convertRawStats = function(Model, raw) {
  debug('convertRawStats', [Model, raw]);
  //All of the necessary parts of the raw statistics are converted into
  //the parameters needed to compute the rating of the votes instance

  var commentView, subView, ageQ, Wcomment, Wsubarticle, Wvote;

  //TODO Use clicks instead of age
  var total = raw.comment.age.count + raw.upVote.age.count;

  if(Model.modelName === 'article') {
    total += raw.subarticle.age.count;
    Wsubarticle = raw.subarticle.age.count/total;

    subView = Stat.getGeometricStats(raw.subarticle.views);
    //ageQ = Stat.getAgeQFunction(raw.article.age);
  }

  Wcomment = raw.comment.age.count/total;
  Wvote =  raw.upVote.age.count/total;

  commentView = Stat.getGeometricStats(raw.comment.views);

  //TODO Remove the ageQFunction
  var stats = {
    //  age: ageQ,
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
*/
  /*
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
var std = Math.sqrt(stats.variance);
var mean = stats.mean + 2.5*std;

var normalization  = (1 - common.math.cdf(0, mean, stats.variance));
var q = function(stats, norm) {
return function(age) {
var res = (1 - common.math.cdf(age, mean, stats.variance))/norm;
console.log(
'Age: ' + age +
'\tMean: ' + mean + 
'\tVar: ' + stats.variance + 
'\tDecay: ' + res
);
return res;
};
};
return q(stats, normalization);
};
*/
/*
   Stat.on('dataSourceAttached', function(obj) {
   debug('dataSourceAttached', obj);
   Stat.find({
   where: {
   id: Stat.averageId 
   }
   }, function(err, res) {
   if(err) {
   return console.log('Error: Failed to load ' + Stat.averageId +
   ': ' + JSON.stringify(err));
   }
   if(res.length === 0) {
//Create the average user
var hour = 60*60*1000;
var day = hour*24;
var average = {
id: Stat.averageId,
version: 0,
//TODO depricate age
//and replace it with clicks counts

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
*/
};
