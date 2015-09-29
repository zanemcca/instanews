
exports.disableRemotes = function(Model,list,isStatic) {
  /*
     if (isStatic) {
     console.log('\nDisabling staic remote methods on ' + Model.modelName);
     }
     else {
     console.log('\nDisabling nonStatic remote methods on ' + Model.modelName);
     }*/

  for(var i = 0; i < list.length; i++) {
    var method = list[i];
    //console.log('\tDisabling ' + method);
    Model.disableRemoteMethod(method, isStatic);
  }
};

exports.initBase = function(Model) {
  var staticDisable = [
  ];

  var nonStaticDisable = [
    '__updateById__upVotes',
    '__delete__upVotes',
    '__delete__downVotes',
    '__updateById__downVotes'
  ];

  exports.disableRemotes(Model,staticDisable,true);
  exports.disableRemotes(Model,nonStaticDisable,false);
};

//readModifyWrite
// with an Optimistic Locking Strategy
exports.readModifyWrite = function(Model, query, modify, cb, options) {
  var MAXRETRYS = 20;
  var versionName = 'version';
  var retryCount = MAXRETRYS;

  if(options) {
    if(options.customVersionName) {
      versionName = options.customVersionName;
    }
    if(typeof(options.retryCount) === 'number') {
      retryCount = options.retryCount;
      if(retryCount > MAXRETRYS) {
        console.warn('Warning: Only ' + MAXRETRYS + ' retrys are allowed but ' +
                    retryCount + ' were requested');
        retryCount = MAXRETRYS;
      }
    }
  }

  Model.find(query, function(err,res) {
    if(err) {
      console.warn('Warning: Transaction failed to read: ' +
                  JSON.stringify(err));
      cb(err);
    }
    else if(res.length === 0 ){
      cb(null, 0);
    }
    else {
      var update = function(instance, cb) {
        var where = {
          id: instance.id,
        };

        if(versionName && instance.hasOwnProperty(versionName)) {
          where[versionName] = instance[versionName];
        }
        else {
          var err = new Error('The given versionName is invalid.' +
                              'Cannot complete readModifyWrite');
          err.status = 400;
          return cb(err);
        }

        //Remove all related models before saving the instance
        if(query.include) {
          var relation = '';
          if(Object.prototype.toString.call(query.include) ===
             '[object Array]') {
            for(var idx in query.include) {
              relation = query.include[idx].relation;
              if(instance.hasOwnProperty(relation)) {
                delete instance[relation];
              }
            }
          }
          else {
            relation = query.include.relation;
            if(instance.hasOwnProperty(relation)) {
              delete instance[relation];
            }
          }
        }

        Model.updateAll(where, instance, function(err, res) {
          if(err) {
            console.warn('Warning: Transaction failed to update: ' +
                        JSON.stringify(err));
            cb(err);
          }
          else{
            if(res.count === 0) {
              if(retryCount > 0) {
                var opt = {
                  retryCount: retryCount - 1
                };

                if(options) {
                  opt.customVersionName = options.customVersionName;
                }

                //Only retry for this insance specifically
                query.where = {
                  id: instance.id
                };
                exports.readModifyWrite(Model, query, modify, cb, opt); 
              }
              else {
                /*
                   console.log('Warning: Transaction failed to update.' +
                   ' Likely due to version number');
                   */
                var e = new Error('Transaction failed to update too many times.' +
                                  'likely due to version number');
                e.status = 409;
                cb(e);
              }
            }
            else if(res.count > 1) {
              console.warn('Warning: More than one instance was updated: ' +
                          res.count);
              cb(null, res);
            }
            else {
              cb(null, res);
            }
          }
        });
      };

      var count = 0;
      var results = 0; 
      var error = null;

      var callback = function(err, result) {
        count++;
        if(err && !error) {
          error = err; 
        }
        if(result) {
          results += result.count;
        }

        if(count === res.length) {
          cb(error, results);
        }
      };

      for(var i = 0; i < res.length; i++) {
        if(res[i].toObject) {
          update(modify(res[i].toObject()), callback);
        } else {
          update(modify(res[i]), callback);
        }
      }
    }
  });
};

//Math functions
exports.math = {
  /*
   * TODO Test and then these can be used
  //Error function
  erf: function(x) {

    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;

    var sign;
    if(x > 0) {
      sign = 1;
    }
    else {
      sign = -1;
    }

    x = Math.abs(x);
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x));
    return sign*y;
  },
  //Cumulative Distribution Function of normal distribution
  cdf: function(x, mean, variance) {
    return 0.5*(1+exports.math.erf((x- mean) /(Math.sqrt(2*variance))));
  },
 */
  //Performs a geometric decay of the given array
  geometricDecay: function(votables, decay) {
    if(decay <= 0 || decay >= 1) {
      console.error(
        'Error: Decay factor must be less than 1 and greater than 0: ' + decay);
        return 0;
    }

    var p = 0;
    if( votables.length > 0) {
      var total = 1;
      for(var i = 0; i < votables.length; i++) {
        var r = votables[i];
        if(typeof r.rating === 'number') {
          r = r.rating;
        }
        p += total*r;
        total *= decay;
      }
      if(total < 1) {
        p *= (1- decay)/(1- total);
      }
      else {
        console.error('Error: Geometric decay total > 1'); 
        p = 0;
      }
    }

    return p;
  },
  /*
   * TODO Test and then these can be used
  //Converts nonCentral moments to central moments
  convertMoments: function(moments) {
    console.log(
      'Moments: ' +
        '  First: ' + moments.first +
        '  Second: ' + moments.second +
        '  Third: ' + moments.third +
        '  Count: ' + moments.count
    );

    //Convert first, second and third moments to mean, std, and skew 
    var mean = moments.first/moments.count;
    var std;
    if(moments.second && mean !== undefined) {
      var variance = moments.second/moments.count - mean*mean;
      if(variance < 0) {
        console.error('Error: Variance is negative: ' + variance);
      }
      else {
        std = Math.pow(variance, 1/2);
      }
    }
    var skew;
    if(moments.third && mean !== undefined && std !== undefined) {
      skew = (moments.third/moments.count - mean * (3*std*std - mean*mean));
      skew /= (Math.pow(std,3));
    }

    return {
      mean: mean,
      std: std,
      skew: skew
    };
  }
 */
};

//Date functions
/*
exports.date = {
  minutesAgo: function(minutes) {
    var now = (new Date()).getTime();
    var minutesAgo = new Date(now - minutes*60000);
    return minutesAgo;
  }
};
*/
