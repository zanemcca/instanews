var thunk = require('./thunk');
var async = require('async');
var common = require('../common');
var relations = require('./relations');
var Models = relations.models; 
var PreDependencies = relations.preDependencies; 
var app = common.app;
var api = common.api;

//Export and test
exports.on = require('./on').on; 
exports.instances = require('./instances').instances;
exports.users = require('./users').users;
var getModelInstance = relations.getModelInstance;
var helpers = require('./helpers');
var getUrl = helpers.getUrl;
var post = helpers.post;

var createCreate = function(model) {
  return {
    create: function(inst, cb) {
      var parent = exports.instances.getActionableInstance();
      if(!cb) {
        cb = inst;
        inst = getModelInstance(model, parent);
      }
      var url = getUrl(model, parent);

      exports.users.getToken(inst.username, function(err, token) {
        if(err) return cb(err);

        var createPreDependency = function(name, cb) {
          var parent = exports.instances.getActionableInstance();
          var url = getUrl(name, parent);
          var inst = getModelInstance(name, parent);

          post(url, token, inst, function(err, instance) {
            exports.instances.add(instance, parent);
            cb(err, instance);
          });
        };

        var names = PreDependencies[model];
        if(names && names.length) {
          thunk.run(createPreDependency, names, function (err, insts) {
            post(url, token, inst, function(err, instance) {
              exports.instances.add(instance, parent);
              cb(err, instance);
            });
          });
        } else {
          post(url, token, inst, function(err, instance) {
            exports.instances.add(instance, parent);
            cb(err, instance);
          });
        }

      });
    }
  };
};

for(var model of Object.getOwnPropertyNames(Models)) {
  exports[model] = createCreate(model);
}
