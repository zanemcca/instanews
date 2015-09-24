
var thunk = require('./thunk');
var async = require('async');
var common = require('../common');
var relations = require('./relations');
var Models = relations.models; 

var help = require('./helpers');
var destroy = help.destroy;

var app = common.app;
var api = common.api;

function Instances() {
  this._instances = [];

  this.getActionableInstance = function () {
    return this._actionable;
  };

  this.setActionableInstance = function (instance) {
    this._actionable = instance;
  };

  this.add = function (instances, parent) {
    if(!parent) {
      this._instances = this._instances.concat(instances);
    } else {
      parent.children = (parent.children || []).concat(instances);
    }
  };

  this.findById = function (id) {
    for(var inst of this._instances) {
      if(inst.id === id) {
        return inst;
      }
    }
  };

  this.last = function (type) {
    if(!type) {
      return this._instances[this._instances.length-1];
    } else {
      for(var inst of this._instances.reverse()) {
        if(inst.modelName === type) {
          return inst;
        }
      }
    }
  };

  this.get = function(type) {
    if(!type) {
      return this._instances;
    } else {
      var insts = [];
      for(var inst of this._instances) {
        if(inst._name === type) {
          insts.push(inst);
        }
      }
      return insts;
    }
  };

  this.clear = function(done) {
    var instances = this.get();

    var cb = function(err) {
      instances.length = 0;
      done(err);
    };

    if(instances.length) {
      var funcs = [];
      var func  = function(inst) {
        return function(cb) {
          clear(inst,cb);
        };
      };

      for(var inst of instances) {
        funcs.push(func(inst));
      }

      async.parallel(funcs, function(err, res) {
        cb(err);
      });
    } else {
      cb();
    }
  };

  var clear = function (inst, cb) {
    if(inst) {
      if(inst.children && inst.children.length) {
        var funcs = [];
        var func  = function(inst) {
          return function(cb) {
            clear(inst,cb);
          };
        };

        for(var instance of inst.children) {
          funcs.push(func(instance));
        }

        async.parallel(funcs, function(err, res) {
          destroy(inst, cb);
        });
      } else {
        destroy(inst, cb);
      }
    } else {
      console.log('That was strange! Why are you trying to delete an empty instance?');
      cb();
    }
  };

  return this;
}

exports.Instances = Instances;
