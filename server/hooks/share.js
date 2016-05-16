
/* jshint camelcase: false */

module.exports = function(app) {

  var Share = app.models.Share;
  var Click = app.models.click;
  var debug = app.debug('hooks:share');

  Share.observe('after delete', function(ctx, next) {
    var dd = app.DD('Share', 'afterDelete');
    debug('after delete', ctx, next);

    //TODO Check the deletion count to make sure an item was deleted before decrementing shareCount
    if(ctx.inc && typeof(ctx.inc) === 'object') {
      ctx.inc.shareCount = -1;
    } else {
      ctx.inc = {
        shareCount: -1
      };
    }
    Click.updateClickableAttributes(ctx, { 
      '$inc': ctx.inc 
    }, function(err) {
      dd.lap('Click.updateClickableAttributes');
      //console.error('Failed to update clickableAttributes');
      next(err);
    });
  });

  Share.observe('after save', function(ctx, next) {
    var dd = app.DD('Share', 'afterSave');
    debug('after save', ctx, next);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      Share.notify(inst);

      //The click after save should have added an incrementation parameter
      if(ctx.inc && typeof(ctx.inc) === 'object') {
        ctx.inc.shareCount = 1;
        Click.updateClickableAttributes(ctx, { 
          '$inc': ctx.inc 
        }, function(err) {
          dd.lap('Click.updateClickableAttributes');
          //console.error('Failed to update clickableAttributes');
          next(err);
        });
      }
      else {
        var error = new Error('Upvote expected there to be ctx.inc!');
        error.status = 400;
        console.error(error.stack);
        next(error);
      }
    }
    else {
      console.warn('Warning: Invalid instance for upvote!');
      next();
    }
  });
};
