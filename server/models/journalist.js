
var common = require('./common');

module.exports = function(Journalist) {

   var staticDisable = [
      'exists',
      'find',
      'findOne',
      'upsert',
      'prototype.updateAttributes',
      'deleteById',
      'confirm',
      'resetPassword',
      'createChangeStream',
      'createChangeStream_0',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable most accessToken REST endpoints
      '__get__accessTokens',
      '__delete__accessTokens',
      '__destroyById__accessTokens',
      '__findById__accessTokens',
      '__updateById__accessTokens',
      '__count__accessTokens',
      //disable most articles REST endpoints
      '__delete__articles',
      '__destroyById__articles',
      '__findById__articles',
      '__create__articles',
      '__updateById__articles',
      '__count__articles',
      '__unlink__articles',
      '__link__articles',
      '__exists__articles',
      //disable all installation REST endpoints
      '__get__installations',
      '__delete__installations',
      '__destroyById__installations',
      '__findById__installations',
      '__create__installations',
      '__updateById__installations',
      '__count__installations',
      //disable most notification REST endpoints
      '__delete__notifications',
      '__destroyById__notifications',
      '__findById__notifications',
      '__create__notifications',
      '__count__notifications',
      //disable all subarticle REST endpoints
      '__get__subarticles',
      '__delete__subarticles',
      '__destroyById__subarticles',
      '__findById__subarticles',
      '__create__subarticles',
      '__updateById__subarticles',
      '__count__subarticles',
      //disable all stat REST endpoints
      '__get__stats',
      '__destroy__stats',
      '__create__stats',
      '__update__stats',
      //disable all clicks REST endpoints
      '__get__clicks',
      '__delete__clicks',
      '__destroyById__clicks',
      '__findById__clicks',
      '__create__clicks',
      '__updateById__clicks',
      '__count__clicks',
      //disable all views REST endpoints
      '__get__views',
      '__delete__views',
      '__destroyById__views',
      '__findById__views',
      '__create__views',
      '__updateById__views',
      '__count__views'
   ];

   common.disableRemotes(Journalist,staticDisable,true);
   common.disableRemotes(Journalist,nonStaticDisable,false);

};
