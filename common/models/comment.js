var common = require('./common');

module.exports = function(Comment) {

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

   //Upvote function
   Comment.prototype.upvote = function( cb) {
      common.upvote(this,cb);
   };

   Comment.remoteMethod( 'upvote', {
      isStatic: false,
      http: { path: '/upvote',  verb: 'post'},
      returns: { arg: 'comment', type: 'string'}
   });

   //Downvote function
   Comment.prototype.downvote = function( cb) {
      common.downvote(this,cb);
   };

   Comment.remoteMethod( 'downvote', {
      isStatic: false,
      http: { path: '/downvote',  verb: 'post'},
      returns: { arg: 'comment', type: 'string'}
   });
};
