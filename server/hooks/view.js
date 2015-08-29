
module.exports = function(app) {

  var View = app.models.view;

  //TODO increment parents viewsCount

  View.observe('before save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst && ctx.isNewInstance) {
      inst.id = null;
      next();
    }
    else {
      console.log('Warning: Invalid instance for views before save');
      next();
    }
  });

};
