
/* jshint camelcase: false */

module.exports = function(app) {

  var Click = app.models.click;
  var Stat = app.models.stat;
  var View = app.models.view;
  var UpVote = app.models.upVote;
  var DownVote = app.models.downVote;
  var loopback = require('loopback');

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

  var preVoteChecker = function(ctx, next) {
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

      Model.findOne(filter, function(err, res) {
        if(err) {
          console.log('Error: Failed to complete preVoteChecker');
          next(err);
        }
        else if(res) {
          var error = new Error('A user can only ' + name + ' once per item');
          error.status = 401;
          console.log(error);
          next(error);
        } 
        else {
          OppositeModel.findOne(filter, function(err, res) {
            if(err) {
              console.log('Error: Failed to complete preVoteChecker');
              next(err);
            }
            else if(res) {
              res.destroy(function(err) {
                if(err) {
                  console.log('Error: Failed to complete preVoteChecker');
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
      });
    }
    else {
      console.log('PreVoteChecker should only be called on new votes');
      next();
    }
  };

  Click.observe('before save', function(ctx, next) {
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
            console.log(inst);
            return next(error);
          }
        }
        else {
          console.log(inst);
          return next(error);
        }
      }
      else {
        console.log(inst);
        return next(error);
      }
    }
    else {
      console.log('Warning: Invalid instance for clicks before save');
      next();
    }
  });

  Click.observe('before save', function(ctx, next) {
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
        console.log(inst);
        return next(error);
      }

      View.findOne({
        where: where, 
        order: 'created DESC'
      }, function(err, res) {
        if(err) {
          console.log('Warning: Failed to find a view for Type: ' +
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
          console.log(err);
          err.status = 403;
          next(err);
        }
      });
    }
    else {
      console.log('Warning: Invalid instance for clicks before save');
      next();
    }
  });

  Click.observe('before delete', function(ctx, next) {
    //Delegate the count updating to the inherited model 
    if(ctx.Model.modelName !== 'click') {
      ctx.inc = {
        clickCount: -1
      };
      next();
    }
    else {
      //TODO This should check the where filter and update the attributes for all parents
      if(ctx.instance) {
        Click.updateClickableAttributes(ctx, {
          '$inc': {
            clickCount: -1
          }
        },
        next);
      } else {
        next();
      }
    }
  });

  Click.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {

      //Delegate the count updating to the inherited model 
      if(ctx.Model.modelName !== 'click') {
        ctx.inc = {
          clickCount: 1
        };
        next();
      }
      else {
        Click.updateClickableAttributes(ctx, {
          '$inc': {
            clickCount: 1
          }
        },
        next);
      }
    }
    else {
      console.log('Warning: Instance is invalid for click');
      next();
    }
  });

  Click.updateVoteParent = function(ctx, next) {
    var inst = ctx.instance;

    if(inst) {
      Click.updateClickableAttributes(ctx, { 
        '$inc': ctx.inc 
      }, function(err) {
        next(err);
      });
    }
    else {
      console.log('Warning: Invalid instance for vote!');
      console.log(inst);
      next();
    }
  };

  Click.updateClickableAttributes = function(ctx, data, next) {
    var inst = ctx.instance;
    if(inst) {
      inst.clickable(function(err, res) {
        if(err) {
          console.log('Warning: Failed to fetch clickable');
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

        res.updateAttributes(data, function(err,res) {
          if(err) {
            console.log('Warning: Failed to save clickable');
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
                console.log('Error: Failed to update the rating for ' +
                            inst.clickableType + ' - ' + inst.clickableId +
                            ' from click ' + inst.id);
                next(err);
              }
              else {
                /*
                if(res !== 1) {
                  console.log('Warning: ' + res + ' ' + inst.clickableType +
                              ' were updated for id:' + inst.clickableId +
                              ' when there should have been one');
                }
               */
                next();
              }
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
      console.log(error);
      next(error);
    }
  };

  Click.addAgeSample = function(ctx, age, next) {
    if(ctx.instance) {
      var inst = ctx.instance;
      //Only new clicks can add sample ages
      if(ctx.isNewInstance) {
        Stat.addSample({
          username: inst.username
        }, ctx.Model.modelName, 'age', age, function(err, res) {
          if(err) {
            console.log('Error: Failed to add interaction age for upVote');
            console.log(err);
            next(err);
          }
          else {
            Stat.addSample({
              username: inst.username
            },
            inst.clickableType,
            'age',
            age,
            function(err, res) {
              if(err) {
                console.log('Error: Failed to add interaction age for ' +
                            inst.clickableType);
                console.log(err);
              }
              next(err);
            });
          }
        });
      }
      else {
        next();
      }
    }
    else {
      var error = new Error('Invalid instance for Click.addAge');
      console.log(error);
      next(error);
    }
  };
};
