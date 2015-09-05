
module.exports = function(app) {

  var View = app.models.view;
  var loopback = require('loopback');

  View.observe('before save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      inst.id = null;
      var context = loopback.getCurrentContext();
      if(context) {
        var token = context.get('accessToken');
        if(token) {
          inst.username = token.userId;
          return next();
        }
      }
      var error = new Error(
        'Cannot create a view because there is no user logged in.');
      error.code = 400;
      console.log(error);
      next(error);
    }
    else {
      console.log('Warning: Invalid instance for views before save');
      next();
    }
  });

  View.updateViewableAttributes = function(ctx, data, next) {
    if(ctx.instance) {
      //Only new instances can update the attributes of the parent
      if(ctx.isNewInstance) {
        ctx.instance.viewable(function(err, res) {
          if(err) {
            console.log('Warning: Failed to fetch viewable');
            return next(err);
          }

          res.updateAttributes(data, function(err,res) {
            if(err) {
              console.log('Warning: Failed to save viewable');
              next(err);
            }
            else {
              next();
            }
          });
        });
      }
      else {
        next();
      }
    }
    else {
      var error = new Error('Invalid instance for updateViewableAttributes');
      console.log(error);
      next(error);
    }
  };

  View.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      View.updateViewableAttributes(ctx, {
        '$inc': {
          viewCount: 1
        }
      },
      next);
    }
    else {
      console.log('Warning: Instance is invalid after view creation');
      next();
    }
  });
};
