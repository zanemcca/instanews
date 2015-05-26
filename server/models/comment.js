var common = require('./common');

module.exports = function(Comment) {

   common.initVotes(Comment);

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
      '__get__commentable',
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
