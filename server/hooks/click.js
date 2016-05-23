
/* jshint camelcase: false */

module.exports = function(app) {

  var Click = app.models.click;
  var Base = app.models.base;
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
      if(loc1.coordinates) {
        loc1 = {
          lng: loc1.coordinates[0],
          lat: loc1.coordinates[1]
        };
      }
      if(loc2.coordinates) {
        loc2 = {
          lng: loc2.coordinates[0],
          lat: loc2.coordinates[1]
        };
      }

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
    var dd = app.DD('Click', 'preVoteChecker');
    var inst = ctx.instance;
    /* istanbul ignore else */
    if(inst && ctx.isNewInstance) {
      var name = ctx.Model.modelName;
      var Model, OppositeModel;
      var modelName, oppositeModelName;
      switch(name) {
        case 'upVote':
          modelName = 'UpVote';
          oppositeModelName = 'DownVote';
          Model = UpVote;
          OppositeModel = DownVote;
          break;
        case 'downVote':
          modelName = 'DownVote';
          oppositeModelName = 'UpVote';
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
        dd.lap(oppositeModelName + '.findOne');
        if(err) {
          console.error('Error: Failed to complete preVoteChecker');
          next(err);
        } else if(res) {
          res.destroy(function(err) {
            dd.lap(oppositeModelName + '.destroy');
            if(err) {
              console.error('Error: Failed to complete preVoteChecker');
              next(err);
            } else {
              next();
            }
          });
        } else {
          Model.findOne(filter, function(err, res) {
            dd.lap(modelName + '.findOne');
            if(err) {
              console.error('Error: Failed to complete preVoteChecker');
              next(err);
            } else if(res) {
              console.log('Destroying the vote instead of creating one');
              res.destroy(function (err, count) {
                dd.lap(modelName + '.destroy');
                if(err) {
                  console.error('Error: Failed to destroy the vote');
                } else {
                  err = new Error('Destroying existing vote instead of creating another one');
                  err.status = 204;
                }
                next(err);
              });
            } else {
              next();
            }
          });
        }
      });
    } else {
      console.warn('Warning: PreVoteChecker should only be called on new votes');
      next();
    }
  };

  Click.observe('before save', function(ctx, next) {
    var dd = app.DD('Click', 'beforeSave');
    debug('observe  - before save', ctx);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      delete inst.id;

      inst.modelName = ctx.Model.modelName;

      var error = new Error('Missing key information for new click!');
      error.status = 400;

      var context = loopback.getCurrentContext();
      if(context) {
        var token = context.get('accessToken');
        if(token) {
          inst.username = token.userId;
          if(inst.clickableId && inst.clickableType) {
            preVoteChecker(ctx, function(err) {
              dd.lap('Click.preVoteChecker');
              next(err);
            });
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
    var dd = app.DD('Click', 'beforeSave');
    debug('observe - before save', ctx);
    var inst = ctx.instance;
    if(inst && ctx.isNewInstance) {
      var where;
      if(inst.clickableId === null) {
        return next();
      }
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
        order: 'id DESC'
      }, function(err, res) {
        dd.lap('View.findOne');
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
          View.create(where, function (err, res) {
            dd.lap('View.create');
            if(err || !res) {
              console.warn('Warning: Failed to create a view for Type: ' +
                           inst.clickableType + '\tTypeId: ' +
                           inst.clickableId);
              /* istanbul ignore if */
              if(!err) {
                err = new Error('No result given');
                err.status = 403;
              }

              next(err);
            } else {
              //console.log('View created and click about to be created');
              inst.viewId = res.id;
              inst.clickableType = res.viewableType;
              inst.clickableId = res.viewableId;
              next();
            }
          });
        }
      });
    }
    else {
      console.warn('Warning: Invalid instance for clicks before save');
      next();
    }
  });

  Click.observe('after delete', function(ctx, next) {
    debug('observe - after delete', ctx);
    var dd = app.DD('Click', 'afterDelete');
    //Delegate the count updating to the inherited model 

    /* istanbul ignore next */
    if(ctx.instance) {
      var inc = {};
      if(ctx.instance.type) {
        inc[ctx.instance.type + 'Count'] = -1;

        //This should never be necessary as we do not delete create clicks
        if(ctx.instance.type.indexOf('create') === 0) {
          var modelName = inst.type.slice(6).toLowerCase();
          //Set the `modelName` flag in the deferred update to indicate its portion
          //of the rating must be updated 
          data[modelName] = true;
        }
      }

      if(ctx.Model.modelName !== 'click') {
        ctx.inc = inc;
        next();
      } else {
        //TODO This should check the where filter and update the attributes for all parents
        Click.updateClickableAttributes(ctx, {
          '$inc': inc 
        }, function(err) {
          dd.lap('Click.updateClickableAttributes');
          next(err);
        });
      }
    } else {
      next();
    }
  });

  Click.observe('after save', function(ctx, next) {
    var dd = app.DD('Click', 'afterSave');
    debug('observe - after save', ctx);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      var data = {
        '$inc': {} 
      };

      if(ctx.instance.type) {
        data.$inc[ctx.instance.type + 'Count'] = 1;
        if(ctx.instance.type.indexOf('create') === 0) {
          var modelName = inst.type.slice(6).toLowerCase();
          //Set the `modelName` flag in the deferred update to indicate its portion
          //of the rating must be updated 
          data[modelName] = true;
        }
      }

      //Delegate the count updating to the inherited model 
      if(ctx.Model.modelName !== 'click') {
        ctx.inc = data.$inc;
        next();
      }
      else {
        //dd.increment((ctx.instance.type || 'click'), ['instanceId:' + inst.clickableId,'instanceType:' + inst.clickableType, 'viewId:' + inst.viewableId]);
        Click.updateClickableAttributes(ctx, data, function(err) {
          dd.lap('Click.updateClickableAttributes');
          next(err);
        });
      }
    }
    else {
      console.warn('Warning: Instance is invalid for click');
      next();
    }
  });

  Click.updateVoteParent = function(ctx, next) {
    var dd = app.DD('Click', 'updateVoteParent');
    debug('updateVoteParent', ctx);
    var inst = ctx.instance;

    if(inst) {
      Click.updateClickableAttributes(ctx, { 
        '$inc': ctx.inc 
      }, function(err) {
        dd.lap('Click.updateClickableAttributes');
        //console.error('Failed to update clickableAttributes');
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
    var dd = app.DD('Click', 'updateClickableAttributes');
    debug('updateClickableAttributes', ctx, data);
    var inst = ctx.instance;
    if(inst) {
      var modelName = inst.clickableType.charAt(0).toUpperCase() + inst.clickableType.slice(1);

      var updateImmediately = ['upVote', 'downVote', 'share', 'createComment'];
      if(updateImmediately.indexOf(ctx.Model.modelName) > -1 || updateImmediately.indexOf(inst.type) > -1) {
        var dat = {
          updateRating : true,
        };

        if(inst.type) {
          var modName = inst.type.slice(6).toLowerCase();
          if(data[modName]) {
            dat[modelName] = true;
          }
        }

        Base.deferUpdate(inst.clickableId, inst.clickableType, { updateRating: true }, function (err) { 
          dd.lap('Base.deferUpdate');
          if(err) {
            console.err('Failed to defer update');
            return next(err);
          }

          inst.clickable(function(err, res) {
            dd.lap('Click.clickable');
            if(err || !res) {
              console.warn('Warning: Failed to fetch clickable');
              return next(err);
            }

            //Upvotes verfiy articles if they are near by
            //TODO Move this to upvote without incuring an
            //extra read
            if(ctx.Model.modelName === 'upVote' &&
               res.modelName === 'article' && !res.verified &&
                 nearBy(res.loc, inst.location)
            ) {

              if(res.username !== inst.username) {
                if(!data.$set) {
                  data.$set = {
                    verified: true
                  };
                }
                else {
                  data.$set.verified = true;
                }
              }
            }

            res.updateAttributes(data, function(err,res) {
              dd.lap(modelName + '.updateAttributes');
              if(err) {
                console.warn('Warning: Failed to save clickable');
                next(err);
              }
              else {
                next();
              }
            });
          });
        });
      } else {
        Base.deferUpdate(inst.clickableId, inst.clickableType, data, function(err) {
          dd.lap('Base.deferUpdate');
          next(err);
        });
      }
    } else {
      var error = new Error('Invalid instance for updateClickableAttributes');
      error.status = 400;
      console.error(error.stack);
      next(error);
    }
  };
};
