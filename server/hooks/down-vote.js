module.exports = function(app) {

  var DownVote = app.models.downVote;
  var Click = app.models.click;
   
  DownVote.observe('after delete', function(ctx, next) {
    ctx.inc = {
      downVoteCount: -1
    };

    Click.updateVoteParent(ctx, next);
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
