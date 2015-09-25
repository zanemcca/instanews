
/* jshint camelcase: false */

module.exports = function(app) {

  var View = app.models.view;
  var loopback = require('loopback');

  View.observe('before save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      inst.id = null;
      var error = new Error(
        'Cannot create a view because there is no user logged in.');
      var context = loopback.getCurrentContext();

      error.status = 400;
      if(context) {
        var token = context.get('accessToken');
        if(token) {
          if( inst.viewableType && inst.viewableId) {
            inst.username = token.userId;
            return next();
          } else {
            error.message = 'View does not have a viewable Type or Id';
          }
        }
      }
      console.error(error.stack);
      next(error);
    }
    else {
      console.warn('Warning: Invalid instance for views before save');
      next();
    }
  });

  View.observe('before delete', function(ctx, next) {
    View.findOne({ where: ctx.where }, function (err, res) {
      if(err) {
        return next(err);
      }
      if(res) {
        View.updateViewableAttributes({
          instance: res
        }, {
          '$inc': {
            viewCount: -1 
          }
        },
        next);
      } else {
        console.warn('Warning: There should have been a viewable instance present');
        next();
      }
    });
  });

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
      console.warn('Warning: Instance is invalid after view creation');
      next();
    }
  });

  View.updateViewableAttributes = function(ctx, data, next) {
    if(ctx.instance) {
      ctx.instance.viewable(function(err, res) {
        if(err) {
          console.warn('Warning: Failed to fetch viewable');
          return next(err);
        }

        if(res) {
          res.updateAttributes(data, function(err,res) {
            if(err) {
              console.warn('Warning: Failed to save viewable');
              next(err);
            } else {
              next();
            }
          });
        } else {
          console.warn('Warning: There should have been a viewable instance present');
          next();
        }
      });
    } else {
      var error = new Error('Invalid instance for updateViewableAttributes');
      error.status = 400;
      console.error(ctx);
      next(error);
    }
  };
};
