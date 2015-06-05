
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

exports.run = function() {
   describe('Hooks', function() {
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
