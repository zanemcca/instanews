
module.exports = function(app) {

   var Article = app.models.Article;

   Article.observe('before save', function(ctx, next) {
      var inst = ctx.instance;

      if (inst && ctx.isNewInstance) {
         inst.modelName = 'article';
      }

      next();
   });

};
