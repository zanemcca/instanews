var common = require('./common');

module.exports = function(Subarticle) {


   common.initVotes(Subarticle);

   var staticDisable = [
      'find',
      'exists',
      'updateAll'
   ];

   var nonStaticDisable = [
      '__delete__comments'
   ];

   common.disableRemotes(Subarticle,staticDisable,true);
   common.disableRemotes(Subarticle,nonStaticDisable,false);

   Subarticle.observe('before save', function(ctx, next) {
      var inst = ctx.instance;

      if ( inst ) {
      }
   });

};

