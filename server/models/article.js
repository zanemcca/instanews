
var common = require('./common');

module.exports = function(Article) {

   common.initVotes(Article);

   var staticDisable = [
      'exists',
      'count',
      'findOne',
      'findById',
      'upsert',
      'prototype.updateAttributes',
      'deleteById',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable all comment REST endpoints
      '__get__comments',
      '__delete__comments',
      '__destroyById__comments',
      '__findById__comments',
      '__create__comments',
      '__updateById__comments',
      '__count__comments',
      //disable all upvote REST endpoints
      '__get__upVotes',
      '__delete__upVotes',
      '__destroyById__upVotes',
      '__findById__upVotes',
      '__create__upVotes',
      '__updateById__upVotes',
      '__count__upVotes',
      //disable all downvote REST endpoints
      '__get__downVotes',
      '__delete__downVotes',
      '__destroyById__downVotes',
      '__findById__downVotes',
      '__create__downVotes',
      '__updateById__downVotes',
      '__count__downVotes',
      //disable most subarticles REST endpoints
      '__delete__subarticles',
      '__destroyById__subarticles',
      '__findById__subarticles',
      '__updateById__subarticles',
      '__count__subarticles',
      //disable all journalist REST endpoints
      '__get__journalists',
      '__delete__journalists',
      '__destroyById__journalists',
      '__findById__journalists',
      '__create__journalists',
      '__updateById__journalists',
      '__count__journalists',
      '__exists__journalists',
      '__unlink__journalists',
      '__link__journalists',
   ];

   common.disableRemotes(Article,staticDisable,true);
   common.disableRemotes(Article,nonStaticDisable,false);
};
