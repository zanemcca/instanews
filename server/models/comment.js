var common = require('./common');

module.exports = function(Comment) {

   common.initVotes(Comment);

   Comment.readModifyWrite = function(query, modify, cb, options) {
     common.readModifyWrite(Comment, query, modify, cb, options);
   };

   var staticDisable = [
      'exists',
      'count',
      'find',
      'findOne',
      'findById',
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
      '__get__commentable',
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
      //disable journalist REST endpoint
      '__get__journalist'
   ];

   common.disableRemotes(Comment,staticDisable,true);
   common.disableRemotes(Comment,nonStaticDisable,false);
};
