
/* jshint camelcase: false */

module.exports = function(app) {

  var DownVote = app.models.downVote;
  var Click = app.models.click;
   
  DownVote.observe('after delete', function(ctx, next) {
    //The click after save should have added an incrementation parameter
    if(ctx.inc && typeof(ctx.inc) === 'object') {
      ctx.inc.downVoteCount = -1;
      Click.updateVoteParent(ctx, next);
    } else if(ctx.where) {
      //TODO deal with deletion of multiple votes
      console.log('warning: Strange downvote deletion request!');
      console.log(ctx.where);
      next();
    }
    else {
      var error = new Error('Upvote  deletion expected there to be ctx.inc!');
      error.http_code = 400;
      console.log(error);
      next(error);
    }
  });

  DownVote.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {

      //The click after save should have added an incrementation parameter
      if(ctx.inc && typeof(ctx.inc) === 'object') {
        ctx.inc.downVoteCount = 1;
        Click.updateVoteParent(ctx, next);
      }
      else {
        var error = new Error('Downvote expected there to be ctx.inc!');
        error.http_code = 400;
        console.log(error);
        next(error);
      }
    }
    else {
      console.log('Warning: Invalid instance for downvote!');
      next();
    }
  });
};
