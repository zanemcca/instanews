var common = require('./common');

module.exports = function(Comment) {

   common.initVotes(Comment);

   var staticDisable = [
      'create',
      'find',
      'exists',
      'upsert',
      'updateAll',
      'findById'
   ];

   var nonStaticDisable = [
      '__get__commentable',
      '__delete__comments'
   ];

   common.disableRemotes(Comment,staticDisable,true);
   common.disableRemotes(Comment,nonStaticDisable,false);
};
