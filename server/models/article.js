
var common = require('./common');

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
};
