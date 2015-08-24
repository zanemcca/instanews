
var async = require('async');
var expect = require('chai').expect;

var common =  require('../common');
var api = common.api;
var app = common.app;

var Roles =       app.models.Role;
var RoleMapping = app.models.RoleMapping;
var AccessToken = app.models.AccessToken;
var Journalists = app.models.Journalist;
var Installations = app.models.Installation;
var Subarticles =  app.models.Subarticle;
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
      require('./article').run();
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
