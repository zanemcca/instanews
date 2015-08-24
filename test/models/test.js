
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
   describe('Models', function() {
      require('./common').run();
   });
};
