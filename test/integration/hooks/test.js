var common =  require('../../common');
var app = common.app;

var Stat =  app.models.stat;

exports.run = function() {
   describe('Hooks', function() {
      require('./comment').run();
      require('./down-vote').run();
      require('./installation').run();
      require('./journalist').run();
      require('./notification').run();
      require('./subarticle').run();
      require('./up-vote').run();
      require('./vote').run();
      require('./base').run();
   });
};
