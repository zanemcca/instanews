
var common = require('./common');

module.exports = function(Journalist) {

   var staticDisable = [
      'exists',
      'updateAll',
      'count'
   ];

   var nonStaticDisable = [
      '__destroy__votes',
      '__update__votes',
      '__create__votes',
      '__get__votes',
      '__create__upVotes',
      '__delete__upVotes',
      '__updateById__upVotes',
      '__upsert__upVotes',
      '__destroyById__upVotes',
      '__create__downVotes',
      '__delete__downVotes',
      '__updateById__downVotes',
      '__upsert__downVotes',
      '__destroyById__downVotes',
      '__delete__articles',
      '__get__accessTokens',
      '__create__accessTokens',
      '__delete__accessTokens',
      '__updateById__accessTokens',
      '__findById__accessTokens',
      '__destroyById__accessTokens',
      '__count__accessTokens'
   ];

   common.disableRemotes(Journalist,staticDisable,true);
   common.disableRemotes(Journalist,nonStaticDisable,false);
};
