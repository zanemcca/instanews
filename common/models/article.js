
var common = require('./common');

var app =

module.exports = function(Article) {

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
      '__delete__subarticles',
      '__destroy__votes',
      '__update__votes',
      '__create__votes'
   ];

   common.disableRemotes(Article,staticDisable,true);
   common.disableRemotes(Article,nonStaticDisable,false);


   //Upvote function
   Article.prototype.upvote = function( cb) {
      common.upvote(this,cb);
   };

   Article.remoteMethod( 'upvote', {
      isStatic: false,
      http: { path: '/upvote',  verb: 'post'},
      returns: { arg: 'article', type: 'string'}
   });

   //Downvote function
   Article.prototype.downvote = function( cb) {
      common.downvote(this,cb);
   };

   Article.remoteMethod( 'downvote', {
      isStatic: false,
      http: { path: '/downvote',  verb: 'post'},
      returns: { arg: 'article', type: 'string'}
   });
};
