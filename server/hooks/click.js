
module.exports = function(app) {

  var Click = app.models.click;
  var Stat = app.models.stat;
  var View = app.models.view;

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


  Click.updateClickableAttributes = function(ctx, data, next) {
    if(ctx.instance) {
      //Only new instances can update the attributes of the parent
      if(ctx.isNewInstance) {
        ctx.instance.clickable(function(err, res) {
          if(err) {
            console.log('Warning: Failed to fetch clickable');
            return next(err);
          }

          //Upvotes verfiy articles if they are near by
          //TODO Move this to upvote without incuring an
          //extra read
          if(ctx.Model.modelName === 'upVote' &&
             res.modelName === 'article' && !res.verified &&
             nearBy(res.location, ctx.instance.location)
          ) {
            if(!data['$set']) {
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
            var age = Date.now() - res.created;
            Click.addAgeSample(ctx, age, next);
          });
        });
      }
      else {
        next();
      }
    }
    else {
      var error = new Error('Invalid instance for updateClickableAttributes');
      console.log(error);
      next(error);
    }
  };

  Click.addAgeSample = function(ctx, age, next) {
    if(ctx.instance) {
      var inst = ctx.instance;
      //Only new clicks can add sample ages
      if(!ctx.isNewInstance) {
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

  Click.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {

      //Delegate the count updating to the inherited model 
      if(ctx.Model.modelName !== 'click') {
        ctx.inc = {
          clickCount: 1,
          version: 1
        };
        next();
      }
      else {
        Click.updateClickableAttributes(ctx, {
          '$inc': {
            clickCount: 1,
            version: 1
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

  Click.observe('before save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      inst.id = null;

      var where;
      if(inst.viewId) {
        where = {
          username: inst.username,
          id: inst.viewId
        };
      }
      else if( inst.clickableId && inst.clickableType) {
        where = {
          username: inst.username,
          viewableId: inst.clickableId,
          viewableType: inst.clickableType
        };
      }
      else {
        var error = new Error('Missing key information for new click!');
        error.code = 400;
        console.log(inst);
        return next(error);
      }

      View.findOne({
        where: where, 
        order: 'created DESC'
      }, function(err, res) {
        if(err) {
          console.log('Warning: Failed to find a view for id: ' +
                      inst.viewId + '\tType: ' +
                      inst.clickableType + '\tTypeId: ' +
                      inst.clickableId);
          next(err);
        }
        else if(res) {
          console.log('View found!');
          console.log(res);
          inst.viewId = res.id;
          inst.clickableType = res.viewableType;
          inst.clickableId = res.viewableId;
          next();
        }
        else {
          err = new Error('Failed to find view for click');
          console.log(err);
          console.log('TODO Change this to fail!');
          next();
        }
      });
    }
    else {
      console.log('Warning: Invalid instance for clicks before save');
      next();
    }
  });

};
