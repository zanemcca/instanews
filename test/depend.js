var thunk = require('./thunk');
var async = require('async');
var common = require('./common');
var app = common.app;
var api = common.api;

var Models = {
  article: ['subarticle', 'comment', 'view', 'click', 'upVote', 'downVote'],
  subarticle: ['comment', 'view', 'click', 'upVote', 'downVote'],
  comment: ['comment', 'view', 'click', 'upVote', 'downVote'],
  view: ['click', 'upVote', 'downVote'],
  click: [],
  upVote: [],
  downVote: []
};

var CoDependencies = {
  article: ['view'],
  subarticle: ['view'],
  comment: ['view'],
};

var samples = {
  comment: function (parent) {
    return {
      content: generateRandomString(Math.floor(Math.random()*40)),
      commentableType: parent.modelName,
      commentableId: parent.id 
    };
  },
  view: function (parent) {
    return {
      viewableId: parent.id,
      viewableType: parent.modelName
    };
  },
  click: function (parent) {
    return {
      clickableId: parent.id,
      clickableType: parent.modelName
    };
  },
  upVote: function (parent) {
    return {
      clickableId: parent.id,
      clickableType: parent.modelName
    };
  },
  downVote: function (parent) {
    return {
      clickableId: parent.id,
      clickableType: parent.modelName
    };
  },
  article: function () {
    return {
      title: generateRandomString(),
      isPrivate: false,
      location: generateRandomLocation() 
    };
  },
  subarticle: function (parent) {
    return {
      text: generateRandomString(Math.floor(Math.random()*500)),
      parentId: parent.id
    };
  },
  journalist: function (name) {
    return {
      password: generateRandomString(),
      username: name,
      email: name + '@mail.com'
    };
  }
};

/*
   var Models = {
article: ['subarticle', 'comment'],
subarticle: ['comment'],
comment: []
};
*/

// Parents is an inverted form of Models
var Parents = {};
for(var type of Object.getOwnPropertyNames(Models)) {
  var children = Models[type];
  for(var child of children) {
    // Build the reverse Model tree
    if(Parents.hasOwnProperty(child)) {
      if(!Parents[child].hasOwnProperty(type)) {
        Parents[child].push(type);
      }
    } else {
      Parents[child] = [type];
    }
  }
}

//Classes
function CreateModel(previous, name) {
  return function(instance) {
    return new Model(previous, name, instance);
  };
}

function Model(previous, name, instance) {
  this._previous = previous;
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
      return getURL(this._name, this.parent.instance);
    } else {
      return getURL(this._name);
    }
  }
});

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

    var cb = function(err) {
      instances.length = 0;
      done(err);
    };
  };

  var clear = function (inst, cb) {
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
  };

  return this;
}

var destroy = function(inst, cb) {
  //console.log(inst);
  var name = inst.modelName;
  var id = inst.id;
  if(!name) {
    if(inst.userId) {
      name = 'journalist';
      id = inst.userId;
    } else if(inst.clickableId) {
      name = 'click';
    } else {
      name = 'view';
    }
  }

  if( app.models.hasOwnProperty(name)) {
    model = app.models[name];
    model.destroyById(id, cb);
  } else {
    var e = new Error('Failed to find '+ name + ' on app.models');
    e.status = 400;
    return cb(e);
  }
};

function UserArray() {
  this._users = [];

  var findOne = function(param, value) {
    for(var user of this._users) {
      if( user[param] === value) {
        return user;
      }
    }
  };

  this.getToken = function(username, cb) {
    if(username || !this._users.length) {
      var token;
      if(!username) {
        username = generateRandomString();
      } else {
        token =  findOne('userId', username).id;
      }

      if(token) {
        cb(null, token);
      } else {
        createUserAndLogin(username, function (err, user) {
          if (err) return cb(err);
          exports.users.add(user);
          cb(null, user.id);
        });
      }
    } else {
      cb(null, this._users[0].id);
    }
  };

  this.remove = function (username) {
    for(var idx in this._users) {
      var user = this._users[idx];
      if( user.userId === username) {
        //TODO Logout and destroy
        this._users.splice(idx,1);
      }
    }
  };

  this.add = function (user) {
    this._users.push(user);
  };

  this.get = function () {
    return this._users;
  };

  this.clear = function(done) {
    var instances = this.get();
    if(instances.length) {
      var funcs = [];
      var func  = function(inst) {
        return function(cb) {
          destroy(inst,cb);
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

    var cb = function(err) {
      instances.length = 0;
      done(err);
    };
  };
  return this;
}

//Functions
var Describe = function (previous) {
  return function (description, next) {
    description += ' ' + previous.toString();

    previous = previous.addDependencies();

    describe(description, function () {
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
        exports.instances.clear(function (err) {
          if(err) return done(err);
          exports.users.clear(done);
        });
      });

      next();
    });
  };
};

function satisfyDependencies(current, done) {
  if(current) {
    //Setup createables for first run
    if(!this.createables) {
      this.createables = [];
    }

    var actions = ['on','by','plus'];
    if(actions.indexOf(current._name) > -1) {
      if(current._name === 'on') {
        if(this.createables.length) {
          //Add parent pointers on all of the createables
          for(var i =0; i < this.createables.length - 1; i++) {
            this.createables[i].parent = this.createables[i+1];
          }
          this.createables[this.createables.length - 1].parent = this.parent;
          this.createables[this.createables.length - 1].isActionable = true;
          // Create the createables in order
          thunk.run(create, this.createables.reverse(), function(err, instances) {
            if(!err) {
              this.parent = this.createables[this.createables.length - 1];
              this.createables.length = 0;
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

  exports.users.getToken(username, function (err, token) {
    if (err) return cb(err);
    post(url, token, inst, function(err, instance) {
      model.instance = instance;

      var parent = model.parent;
      if(parent) {
        exports.instances.add(instance, model.parent.instance);
      } else {
        exports.instances.add(instance);
      }

      if(model.isActionable) {
        exports.instances.setActionableInstance(instance);
      }

      var children = model.getCodependencies();

      if(children.length) {
        thunk.run(create, children, function (err, insts) {
          cb(err, instance);
        });
      } else {
        cb(err, instance);
      }
    });
  });
}

function post(url, token, data, cb) {
  //console.log('\tURL: ' + url);
  api.post(url)
  .set('Authorization', token)
  .send(data)
  .expect(200)
  .end( function (err, res) {
    if(err) {
      console.log(err.stack);
    }
    cb(err, res.body);
  });
}

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
  } else {
    models = Object.getOwnPropertyNames(Models);
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

  var models = [];
  if(previous._name) {
    models = Models[previous._name];
    if(!models) {
      models = Models[previous._previous._name];
    }
  } else {
    return console.log(new Error('There should be a stack given to Plus!'));
  }

  for(var model of models) {
    this[model] = CreateModel(this, model); 
  }
  return this;
}

// User creation, login, logout and destruction
var generateRandomString = function (length) {
  if(!length) length = 8;
  var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  var name = '';
  for(var i = 0; i < length; i++) {
    name += chars[Math.floor(Math.random()*chars.length)];
  }
  return name;
};

var generateRandomLocation = function (bottomLeft, upperRight) {
  var maxLat, minLat, maxLng, minLng;
  if(bottomLeft && upperRight) {
    maxLat = upperRight.lat;
    maxLng = upperRight.lng;
    minLat = bottomLeft.lat;
    minLng = bottomLeft.lng;
  }

  if(!minLng) {
    minLng = -180;
  }
  if(!minLat) {
    minLat = -90;
  }
  if(!maxLat) {
    maxLat = 90;
  }
  if(!maxLng) {
    maxLng = 180;
  }

  return {
    lat: Math.random()*(maxLat -minLat) + minLat,
    lng: Math.random()*(maxLng -minLng) + minLng
  };
};

function getModelInstance(type, arg) {
  if(samples.hasOwnProperty(type)) {
    return samples[type](arg);
  } else {
    console.log('Type: ' + type +'\tArg: ' + arg);
    var e = new Error('WTF Thats not a valid type!');
    console.log(e);
  }
}

function getURL(type, parent) {
  var url = '/api/';
  switch (type) {
    case 'subarticle':
      url += 'articles/' + parent.id + '/subarticles';
    break;
    default:
      url += type + 's';
  }
  return url;
}

function createUserAndLogin (username, cb) {
  var journalist;
  if(!cb) {
    journalist = getModelInstance('journalist', generateRandomString());
    cb = username;
  } else {
    journalist = getModelInstance('journalist', username);
  }

  app.models.Journalist.create(
    journalist,
    function(err, res) {
      if(err) {
        console.log(err);
        cb(err);
      } else {
        app.models.Journalist.login(journalist, function (err,res) {
          cb(err, res);
        });
      }
    });
}

//Export and test
exports.on = new On();
exports.instances = new Instances();
exports.users = new UserArray();

var createCreate = function(model) {
  return {
    create: function(inst, cb) {
      var parent = exports.instances.getActionableInstance();
      if(!cb) {
        cb = inst;
        inst = getModelInstance(model, parent);
      }
      var url = getURL(model, parent);

      exports.users.getToken(inst.username, function(err, token) {
        if(err) return cb(err);
        post(url, token, inst, function(err, instance) {
          exports.instances.add(instance, parent);
          cb(err, instance);
        });
      });
    }
  };
};

for(var model of Object.getOwnPropertyNames(Models)) {
  exports[model] = createCreate(model);
}
