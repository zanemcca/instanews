
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

  Stat.bonus = {
    upVoteCount: 10,
    downVoteCount: 3,
    getCommentsCount: 8,
    getSubarticlesCount: 30,
    createSubarticleCount: 1,
    createCommentCount: 2,
    viewCount: 270
  };

  Stat.weight = {
    upVotes: 1,
    downVotes: 1,
    subarticles: 0.7, 
    comments: 0.7
  };

  Stat.getRating = function(rateable) {
    var upVoteCount = Stat.bonus.upVoteCount;
    var downVoteCount = Stat.bonus.downVoteCount;
    var getCommentsCount = Stat.bonus.getCommentsCount;
    var getSubarticlesCount = Stat.bonus.getSubarticlesCount;
    var viewCount = Stat.bonus.viewCount;

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

    var clickCount =
      upVoteCount +
      downVoteCount; 

    var Pcom = 0;
    if(typeof(rateable.getCommentsCount) === 'number' &&
       typeof(rateable.notCommentRating) === 'number') {

      clickCount += getCommentsCount;
      Pcom = (1 - rateable.notCommentRating);
      Pcom *= Stat.weight.comments;

      // P(click & comment interaction)
      getCommentsCount += rateable.getCommentsCount;
      // Q function of geometric distribution for P(getCommentsCount > 0)
      Pcom *= (getCommentsCount/(getCommentsCount + viewCount));
    }

    var Psub = 0;
    if(typeof(rateable.getSubarticlesCount) === 'number' &&
       typeof(rateable.notSubarticleRating) === 'number') {

      clickCount += getSubarticlesCount;
      Psub = (1 - rateable.notSubarticleRating);
      Psub *= Stat.weight.subarticles;

      // P(click & subarticle interaction)
      getSubarticlesCount += rateable.getSubarticlesCount;
      // Bernoulli distribution
      Psub *= (getSubarticlesCount/viewCount);
    }

    var Pup = Stat.weight.upVotes * upVoteCount/viewCount;
    var Pdown = Stat.weight.downVotes * downVoteCount/viewCount;

    var Pclick = Stat.getUnion(Pcom, Psub);
    //rating = Stat.getUnion(Pup, Pclick) - Stat.getIntersection(Pclick, Pdown);
    rating = Pup + (1 - Pdown - Pup)*Pclick;

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

    return rating;
  }; 

  Stat.getDefaultRating = function (modelName) {
    var model = {
      upVoteCount: 0,
      downVoteCount: 0,
      viewCount: 1
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
