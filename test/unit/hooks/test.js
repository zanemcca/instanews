exports.run = function() {
   describe('Hooks', function() {
      require('./article').run();
      require('./base').run();
      require('./click').run();
      require('./comment').run();
      require('./down-vote').run();
      /*
      require('./installation').run();
      require('./journalist').run();
      require('./notification').run();
     */
      require('./stat').run();
      require('./subarticle').run();
      require('./up-vote').run();
      require('./view').run();
      /*
      require('./vote').run();
     */
   });
};
