var common = require('./common');

module.exports = function(Subarticle) {

   common.initBase(Subarticle);

   Subarticle.readModifyWrite = function(query, modify, cb, options) {
     common.readModifyWrite(Subarticle, query, modify, cb, options);
   };

   var staticDisable = [
      'exists',
      'create',
      'find',
      'count',
      'findOne',
      'upsert',
      'prototype.updateAttributes',
      'deleteById',
      'createChangeStream',
      'createChangeStream_0',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable all comment REST endpoints
//      '__get__comments',
      '__delete__comments',
      '__destroyById__comments',
      '__findById__comments',
      '__create__comments',
      '__updateById__comments',
      '__count__comments',
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
      '__count__views',
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
      //disable all file REST endpoints
      '__get__file',
      '__destroy__file',
      '__create__file',
      '__update__file',
      //disable the article REST endpoint
      '__get__article',
      //disable the journalist REST endpoint
      '__get__journalist'
   ];

   common.disableRemotes(Subarticle,staticDisable,true);
   common.disableRemotes(Subarticle,nonStaticDisable,false);
};

