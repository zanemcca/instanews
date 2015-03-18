
var common = require('./common');

var app =

module.exports = function(Article) {

   common.initVotes(Article);

   var staticDisable = [
      'exists',
      'updateAll'
   ];

   var nonStaticDisable = [
      '__delete__comments',
      '__create__journalists',
      '__updateById__journalists',
      '__exists__journalists',
      '__unlink__journalists',
      '__link__journalists',
      '__destroyById__journalists',
      '__delete__journalists',
      '__delete__subarticles'
   ];

   common.disableRemotes(Article,staticDisable,true);
   common.disableRemotes(Article,nonStaticDisable,false);

   /*
   Article.afterRemote('find', function(ctx, articles, next) {

      for(var i = 0; i < articles.length; i++) {
         articles[i].__count__upVotes(function (res) {
            console.log('upVotes ', res);
         });
      }
      next();
   });
   */
};
