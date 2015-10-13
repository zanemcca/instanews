
/* jshint camelcase: false */

module.exports = function(app) {

  var Click = app.models.click;
  var Stat = app.models.stat;
  var View = app.models.view;
  var UpVote = app.models.upVote;
  var DownVote = app.models.downVote;
  var loopback = require('loopback');

  var debug = app.debug('hooks:click');
  // Conversion functions
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  };

  var nearBy = function(loc1, loc2) {

    if(loc1 && loc2) {
      //haversine method
      var lat1 = loc1.lat.toRad();
      var lat2 = loc2.lat.toRad();
      var dLat = (loc1.lat - loc2.lat).toRad();
      var dLng = (loc1.lng - loc2.lng).toRad();

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      //Earths radius is 6371Km

      //Return true if the two locations are within 500 meters of eachother
      return (6371000 * c <= 500);
    }
    else {
      return false;
    }
  };

  //TODO Merge upVote and downVote into vote and depricate this as 
  // uniqueness is guaranteed at the database layer
  var preVoteChecker = function(ctx, next) {
    debug('preVoteChecker', ctx);
    var inst = ctx.instance;
    if(inst && ctx.isNewInstance) {
      var name = ctx.Model.modelName;
      var Model, OppositeModel;
      switch(name) {
        case 'upVote':
          Model = UpVote;
        OppositeModel = DownVote;
        break;
        case 'downVote':
          Model = DownVote;
        OppositeModel = UpVote;
        break;
        default:
          return next();
      }

      var filter = {
        where: {
          username: inst.username,
          clickableId: inst.clickableId,
          clickableType: inst.clickableType
        }
      };

      OppositeModel.findOne(filter, function(err, res) {
        if(err) {
          console.error('Error: Failed to complete preVoteChecker');
          next(err);
        }
        else if(res) {
          res.destroy(function(err) {
            if(err) {
              console.error('Error: Failed to complete preVoteChecker');
              next(err);
            }
            else {
              next();
            }
          });
        }
        else {
          next();
        }
      });
    }
    else {
      console.warn('Warning: PreVoteChecker should only be called on new votes');
      next();
    }
  };

  Click.observe('before save', function(ctx, next) {
    debug('observe  - before save', ctx);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      delete inst.id;

      var error = new Error('Missing key information for new click!');
      error.status = 400;

      var context = loopback.getCurrentContext();
      if(context) {
        var token = context.get('accessToken');
        if(token) {
          inst.username = token.userId;
          if(inst.clickableId && inst.clickableType) {
            preVoteChecker(ctx, next);
          }
          else {
            console.dir(inst);
            return next(error);
          }
        }
        else {
          console.error(inst);
          return next(error);
        }
      }
      else {
        console.error(inst);
        return next(error);
      }
    }
    else {
      console.warn('Warning: Invalid instance for clicks before save');
      next();
    }
  });

  Click.observe('before save', function(ctx, next) {
    debug('observe - before save', ctx);
    var inst = ctx.instance;
    if(inst && ctx.isNewInstance) {
      var where;
      if( inst.clickableId && inst.clickableType) {
        where = {
          username: inst.username,
          viewableId: inst.clickableId,
          viewableType: inst.clickableType
        };
      }
      else {
        var error = new Error('Missing key information for new click!');
        error.status = 400;
        console.error(inst);
        return next(error);
      }

      View.findOne({
        where: where, 
        order: 'created DESC'
      }, function(err, res) {
        if(err) {
          console.warn('Warning: Failed to find a view for Type: ' +
                       inst.clickableType + '\tTypeId: ' +
                       inst.clickableId);
          next(err);
        }
        else if(res) {
          inst.viewId = res.id;
          inst.clickableType = res.viewableType;
          inst.clickableId = res.viewableId;
          next();
        }
        else {
          err = new Error('The view is missing for click creation!');
          err.status = 403;
          console.error(err.stack);
          next(err);
        }
      });
    }
    else {
      console.warn('Warning: Invalid instance for clicks before save');
      next();
    }
  });

  Click.observe('before delete', function(ctx, next) {
    debug('observe - before delete', ctx);
    //Delegate the count updating to the inherited model 

    if(ctx.instance) {
      var inc = {};
      if(ctx.instance.type) {
        inc[ctx.instance.type + 'Count'] = -1;
      }

      if(ctx.Model.modelName !== 'click') {
        ctx.inc = inc;
        next();
      } else {
        //TODO This should check the where filter and update the attributes for all parents
        Click.updateClickableAttributes(ctx, {
          '$inc': inc 
        },
        next);
      }
    } else {
      next();
    }
  });

  Click.observe('after save', function(ctx, next) {
    debug('observe - after save', ctx);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      var inc = {};

      if(ctx.instance.type) {
        inc[ctx.instance.type + 'Count'] = 1;
      }

      //Delegate the count updating to the inherited model 
      if(ctx.Model.modelName !== 'click') {
        ctx.inc = inc;
        next();
      }
      else {
        Click.updateClickableAttributes(ctx, {
          '$inc':  inc
        },
        next);
      }
    }
    else {
      console.warn('Warning: Instance is invalid for click');
      next();
    }
  });

  Click.updateVoteParent = function(ctx, next) {
    debug('updateVoteParent', ctx);
    var inst = ctx.instance;

    if(inst) {
      Click.updateClickableAttributes(ctx, { 
        '$inc': ctx.inc 
      }, function(err) {
        next(err);
      });
    }
    else {
      console.warn('Warning: Invalid instance for vote!');
      console.warn(inst);
      next();
    }
  };

  Click.updateClickableAttributes = function(ctx, data, next) {
    debug('updateClickableAttributes', ctx, data);
    var inst = ctx.instance;
    if(inst) {
      inst.clickable(function(err, res) {
        if(err) {
          console.warn('Warning: Failed to fetch clickable');
          return next(err);
        }

        //Upvotes verfiy articles if they are near by
        //TODO Move this to upvote without incuring an
        //extra read
        if(ctx.Model.modelName === 'upVote' &&
           res.modelName === 'article' && !res.verified &&
             nearBy(res.location, inst.location)
          ) {
            if(!data.$set) {
              data.$set = {
                verified: true
              };
            }
            else {
              data.$set.verified = true;
            }
          }

          if(inst.type && inst.type.indexOf('create') === 0) {
            var modelName = inst.type.slice(6);
            var variable = 'not' + modelName + 'Rating';
            if(!data.$mul) {
              data.$mul = {};
            }
            data.$mul[variable] = (1 - Stat.getDefaultRating(modelName));
          }

          res.updateAttributes(data, function(err,res) {
            if(err) {
              console.warn('Warning: Failed to save clickable');
              next(err);
            }
            else {
              Stat.triggerRating({
                id: inst.clickableId
              },
              inst.clickableType,
              null,
              function(err, res) {
                if(err) { 
                  //Conflicts are ok because it means that 
                  //someone else has just triggered the rating.
                  //So we will not throw an error
                  console.error('Error: Failed to update the rating for ' +
                                inst.clickableType + ' - ' + inst.clickableId +
                                ' from click ' + inst.id);
                  console.error(err.stack);
                  return next(err);
                }
                next();
              }); 
            }
            /*
          //TODO Remove this.
          //Age statistics are not needed when we do not use timedecay
          var age = Date.now() - res.created;
          Click.addAgeSample(ctx, age, next);
          */
            });
      });
    } else {
      var error = new Error('Invalid instance for updateClickableAttributes');
      error.status = 400;
      console.error(error.stack);
      next(error);
    }
  };

};
