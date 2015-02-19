module.exports = function(Votes) {

   //Upvoting function
   Votes.upvote = function(cb) {
      console.log('Made it into Votes.upvote');
      Votes.up++;
      var currentTime = Date.now();
      //Update the instantaneous rate
      Votes.rate = 1/(currentTime - Votes.lastUpdated);
      Votes.lastUpdated = currentTime;
      console.log('Made it through Votes.upvote');
      cb();
   };

   /*
   Votes.remoteMethod( 'upvote', {
      http: { path: '/upvote', verb: 'post' },
      returns: { arg: 'status', type: 'string'}
   });
   */
};
