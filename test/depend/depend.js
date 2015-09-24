var thunk = require('./thunk');
var async = require('async');
var common = require('../common');
var app = common.app;
var api = common.api;

var relations = require('./relations');
var Models = relations.models; 
var Parents = relations.parents; 
var getModelInstance = relations.getModelInstance; 
var PreDependencies = relations.preDependencies; 

var help = require('./helpers');
var post = help.post;
var getUrl = help.getUrl;
var destroy = help.destroy;

var Instances = require('./instances');
var Users = require('./users');

//Classes
function CreateModel(previous, name) {
  return function(instance) {
    return new Model(previous, name, instance);
  };
}

function Model(previous, name, instance) {
  if(name === 'by') {
    previous._username = instance;
  }

  this._previous = previous;
  this.Instances = previous.Instances;
  this.Users = previous.Users;

  this._instance = instance;
  this._name = name;

  this.toString = function() {
    var current = this._previous;
    var parents = [];
    if(instance) {
      parents.push(JSON.stringify(instance));
    }

    parents.push(this._name);

    while(current) {
      if(current._instance) {
        parents.push(JSON.stringify(current._instance));
      }

      if(current._name) {
        parents.push(current._name);
      } else {
        console.log(new Error('Every Model should have a _name!'));
      }
      current = current._previous;
    }
    return parents.reverse().join(' ');
  };

  this.describe = Describe(this); 

  this.by = CreateModel(this,'by');

  this.addDependencies = function () {
    //Add all necessary parents
    var model = getLastOnModel(this);
    var parents = Parents[model._name];
    var end = this;
    while(parents && parents.length > 0) {
      end = end.on[parents[0]]();
      parents = Parents[end._name];
    }
    return end;
  };

  //TODO Move the codep creation to the child
  this.getCodependencies = function () {
    var deps = [];
    var codeps = CoDependencies[this._name];
    if(codeps) {
      for(var dep of CoDependencies[this._name]) {
        var model = new Model(this, dep);
        model.parent = this;
        deps.push(model);
      }
    }
    return deps;
  };

  this.getPredependencies = function () {
    var deps = [];
    var predeps = PreDependencies[this._name];
    if(predeps) {
      for(var dep of predeps) {
        var model = new Model(this, dep);
        model.parent = this.parent;
        model._username = this._username;
        deps.push(model);
      }
    }
    return deps;
  };

  return this;
}

Object.defineProperty(Model.prototype, 'on', {
  get: function() {
    return new On(this);
  }
});

Object.defineProperty(Model.prototype, 'plus', {
  get: function() {
    return new Plus(this);
  }
});

Object.defineProperty(Model.prototype, 'instance', {
  get: function() {
    if(this._instance) return this._instance;
    if(this.parent) {
      return getModelInstance(this._name, this.parent.instance);
    } else {
      return getModelInstance(this._name);
    }
  },
  set: function(inst) {
    this._instance = inst;
  }
}); 

Object.defineProperty(Model.prototype, 'url', {
  get: function() {
    if(this._url) return this._url;
    if(this.parent) {
      return getUrl(this._name, this.parent.instance);
    } else {
      return getUrl(this._name);
    }
  }
});

function getLastOnModel(current) {
  var last = current._previous;

  while(last._name !== 'on') {
    current = last;
    last = current._previous;
  }
  return current;
}

// 'on' constructor that is called just in time  
function On(previous) {
  this._previous = previous;
  this._name = 'on';

  var models = [];
  if(previous) {
    var last = getLastOnModel(this);
    var name = last._name;
    models = Parents[name];
    this.Instances = previous.Instances;
    this.Users = previous.Users;
  } else { // This is a new dependency tree
    this.Instances = new Instances.Instances();
    this.Users = new Users.Users();
    models = Object.getOwnPropertyNames(Models);

    var Insts = this.Instances;
    var Usrs = this.Users;
    //Create model wrapper
    var createWrapper = function(name) {
      return {
        create: function(inst, cb) {
          var parent = Insts.getActionableInstance();
          if(!cb) {
            cb = inst;
            inst = getModelInstance(name, parent);
          }
          var url = getUrl(name, parent);

          Usrs.getToken(inst.username, function(err, token) {
            if(err) return cb(err);

            var createPreDependency = function(name, cb) {
              var parent = Insts.getActionableInstance();
              var url = getUrl(name, parent);
              var inst = getModelInstance(name, parent);

              post(url, token, inst, function(err, instance) {
                Insts.add(instance, parent);
                cb(err, instance);
              });
            };

            var names = PreDependencies[name];
            if(names && names.length) {
              thunk.run(createPreDependency, names, function (err, insts) {
                post(url, token, inst, function(err, instance) {
                  Insts.add(instance, parent);
                  cb(err, instance);
                });
              });
            } else {
              post(url, token, inst, function(err, instance) {
                Insts.add(instance, parent);
                cb(err, instance);
              });
            }

          });
        }
      };
    };

    this.models = {};
    for(var mod of models) {
      this.models[mod] = createWrapper(mod);
    }
  }
  if(models) {
    for(var model of models) {
      this[model] = CreateModel(this, model); 
    }
    return this;
  } else {
    return null;
  }
}

function Plus(previous) {
  this._previous = previous;
  this._name = 'plus';
  this.Instances = previous.Instances;
  this.Users = previous.Users;

  var models = [];
  if(previous._name) {
    models = Models[previous._name];
    if(!models) {
      models = Models[previous._previous._name];
    }
  } else {
    return console.log(new Error('There should be a name preceding Plus!'));
  }

  for(var model of models) {
    this[model] = CreateModel(this, model); 
  }
  return this;
}

function satisfyDependencies(current, done) {
  if(current) {
    //Setup createables for first run
    if(!this.createables) {
      this.createables = [];
    }

    var actions = ['on','by','plus'];
    if(actions.indexOf(current._name) > -1) {
      if(current._name === 'on') {
        var createables = this.createables;
        if(createables.length) {
          //Add parent pointers on all of the createables
          for(var i =0; i < createables.length - 1; i++) {
            createables[i].parent = createables[i+1];
          }
          createables[createables.length - 1].parent = this.parent;
          createables[createables.length - 1].isActionable = true;

          var newParent = createables[createables.length - 1];
          // Create the createables in order
          thunk.run(create, createables.reverse(), function(err, instances) {
            if(!err) {
              this.parent = newParent;
              createables.length = 0;
              satisfyDependencies(current._previous, done);
            } else {
              return done(err);
            }
          });
        } else {
          satisfyDependencies(current._previous, done);
        }
      } else {
        satisfyDependencies(current._previous, done);
      }
    } else {
      //Add the model to the createables list
      this.createables.push(current);
      satisfyDependencies(current._previous, done);
    }
  } else {
    this.parent = null;
    done();
  }
}

function create(model, cb) {
  var type = model._name;
  var inst = model.instance;
  var url = model.url;
  var username = model._username;

  model.Users.getToken(username, function (err, token) {
    if (err) return cb(err);

    var Post = function () {
      post(url, token, inst, function(err, instance) {
        if(err) return cb(err);

        model.instance = instance;

        var parent = model.parent;
        if(parent) {
          model.Instances.add(instance, model.parent.instance);
        } else {
          model.Instances.add(instance);
        }

        if(model.isActionable) {
          model.Instances.setActionableInstance(instance);
        }

        /*
           var children = model.getCodependencies();

           if(children.length) {
           thunk.run(create, children, function (err, insts) {
           cb(err, instance);
           });
           } else {
           */
        cb(err, instance);
        // }
      });
    };

    var predeps = model.getPredependencies();
    if(predeps.length) {
      thunk.run(create, predeps, function (err, insts) {
        Post();
      });
    } else {
      Post();
    }
  });
}

var Describe = function (previous) {
  return function (description, next) {
    description += ' ' + previous.toString();

    previous = previous.addDependencies();

    describe(description, function () {
      this.timeout(5000);
      beforeEach( function (done) {
        satisfyDependencies(previous, function(err) {
          if(err) return done(err);
          var current = previous;
          while(current) {
            current._instance = null;
            current._parent = null;
            current.isActionable = false;
            current = current._previous;
          }
          done();
        }); 
      });

      afterEach( function (done) {
        previous.Instances.clear(function (err) {
          if(err) return done(err);
          previous.Users.clear(done);
        });
      });

      next();
    });
  };
};

exports.getModelInstance = getModelInstance;
exports.On = function() {
  return new On(); 
};
