var common = require('./common');

module.exports = function(Subarticle) {
   var staticDisable = [
      'find',
      'exists',
      'updateAll'
   ];

   var nonStaticDisable = [
      '__delete__comments',
      '__destroy__votes',
      '__update__votes',
      '__create__votes',
      '__get__votes'
   ];

   common.disableRemotes(Subarticle,staticDisable,true);
   common.disableRemotes(Subarticle,nonStaticDisable,false);

   //Upvote function
   Subarticle.prototype.upvote = function( cb) {
      common.upvote(this,cb);
   };

   Subarticle.remoteMethod( 'upvote', {
      isStatic: false,
      http: { path: '/upvote',  verb: 'post'},
      returns: { arg: 'subarticle', type: 'string'}
   });

   //Downvote function
   Subarticle.prototype.downvote = function( cb) {
      common.downvote(this,cb);
   };

   Subarticle.remoteMethod( 'downvote', {
      isStatic: false,
      http: { path: '/downvote',  verb: 'post'},
      returns: { arg: 'subarticle', type: 'string'}
   });
};
