var common =  require('../../common');
var app = common.app;

var Stat =  app.models.stat;

exports.run = function() {
   describe('Hooks', function() {
     beforeEach(function(done) {
       Stat.destroyAll( function(err) {
         if(err) done(err);
         else {
           Stat.create({
             id: Stat.averageId,
             subarticle: {
               age: {
                 mean: 3600000,
                 variance: 12960000000000,
                 count: 20
               },
               views: {
                 mean: 20,
                 variance: 1,
                 count: 50
               }
             },
             comment: {
               age: {
                 mean: 3600000,
                 variance: 12960000000000,
                 count: 20
               },
               views: {
                 mean: 20,
                 variance: 1,
                 count: 50
               }
             },
             article: {
               age: {
                 mean: 3600000,
                 variance: 12960000000000,
                 count: 20
               },
               views: {
                 mean: 20,
                 variance: 1,
                 count: 50
               }
             },
             upVote: {
               age: {
                 mean: 3600000,
                 variance: 12960000000000,
                 count: 20
               },
               views: {
                 mean: 20,
                 variance: 1,
                 count: 50
               }
             }
           }, function(err, res) {
             done(err);
           });
         }
       });
     });
      require('./comment').run();
      require('./down-vote').run();
      require('./installation').run();
      require('./journalist').run();
      require('./notification').run();
      require('./subarticle').run();
      require('./up-vote').run();
      require('./vote').run();
      require('./votes').run();
   });
};
