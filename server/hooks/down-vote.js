module.exports = function(app) {

  var DownVote = app.models.downVote;
  var Click = app.models.click;
   
  DownVote.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {

      if(ctx.inc && typeof(ctx.inc) === 'object') {
        ctx.inc.downVoteCount = 1;
        Click.updateClickableAttributes(ctx, { '$inc': ctx.inc }, next);
      }
      else {
        var error = new Error('Upvote expected there to be ctx.inc!');
        console.log(error);
        next(error);
      }
    }
    else {
      console.log('Warning: Invalid instance for upvote!');
    }
  });
};
