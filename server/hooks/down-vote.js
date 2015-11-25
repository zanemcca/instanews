
/* jshint camelcase: false */

module.exports = function(app) {

  var ONE_DAY = 24*60*60*1000; // 1 Day in millisecs
  var ONE_WEEK = 7*ONE_DAY; // 1 Week in millisecs
  var ONE_MONTH = 30*ONE_DAY; // 1 Month in millisecs

  var DownVote = app.models.downVote;
  var Click = app.models.click;
  var debug = app.debug('hooks:downvote');
   
  DownVote.observe('after delete', function(ctx, next) {
    debug('after delete', ctx, next);
    //The click after save should have added an incrementation parameter
    if(ctx.inc && typeof(ctx.inc) === 'object') {
      ctx.inc.downVoteCount = -1;
    } else {
      ctx.inc = {
        downVoteCount: -1
      };
    }
    Click.updateVoteParent(ctx, next);

    /*
    if(ctx.where) {
      //TODO deal with deletion of multiple votes
      console.warn('Strange downvote deletion request!');
      console.warn(ctx.where);
      next();
    }
    else {
      var error = new Error('Upvote  deletion expected there to be ctx.inc!');
      error.status = 400;
      console.error(error.stack);
      next(error);
    }
    */
  });

  DownVote.observe('access', function(ctx, next) {
    //console.log(objectIdWithTimestamp(Date.now() - 2*ONE_WEEK));
    ctx.query.where = ctx.query.where || {};
    ctx.query.where.id = ctx.query.where.id || { gt: app.utils.objectIdWithTimestamp(Date.now() - 2 * ONE_WEEK) };

    debug('observe.access', ctx);
    next();
  });

  DownVote.observe('after save', function(ctx, next) {
    debug('after save', ctx, next);
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {

      //The click after save should have added an incrementation parameter
      if(ctx.inc && typeof(ctx.inc) === 'object') {
        ctx.inc.downVoteCount = 1;
        Click.updateVoteParent(ctx, next);
      }
      else {
        var error = new Error('Downvote expected there to be ctx.inc!');
        error.status = 400;
        console.error(error.stack);
        next(error);
      }
    }
    else {
      console.warn('Warning: Invalid instance for downvote!');
      next();
    }
  });
};
