var async = require('async');
var common = require('../common');
var app = common.app;
var relations = require('./relations');
var getModelInstance = relations.getModelInstance; 

var helpers = require('./helpers');
var destroy = helpers.destroy;

function UserArray() {
  this._users = [];

  function initUsers() {
    var done = false;
    createUserAndLogin(function (err, res) {
      done = true;
    });

    var time = 1;
    var elapsed = 0;
    function loop() {
      if(!done) {
        if( time < 5000) {
          setTimeout(loop, time);
          elapsed += time;
          time *= 2;
        } else {
          throw new Error('This shit took way too long: ' + elapsed);
        }
      }
    }

    loop();
  }

  this.findOne = function(param, value) {
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
        username = common.generate.randomString();
      } else {
        var user =  this.findOne('userId', username);
        if(user) {
          token = user.id;
        }
      }

      if(token) {
        cb(null, token);
      } else {
        var Users = this;
        createUserAndLogin(username, function (err, user) {
          if (err) return cb(err);
          Users.add(user);
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

  this.create = createUserAndLogin;

  this.getDefault = function () {
    return this._users[0];
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
  };

  initUsers();

  return this;
}

function createUserAndLogin (username, cb) {
  var journalist;
  if(!cb) {
    journalist = getModelInstance('journalist', common.generate.randomString());
    cb = username;
  } else {
    journalist = getModelInstance('journalist', username);
  }

  app.models.Journalist.destroyById(username, function(err) {
    app.models.Journalist.create(journalist, function(err, res) {
      if(err) {
        console.log(err);
        cb(err);
      } else {
        app.models.Journalist.login(journalist, function (err,res) {
          cb(err, res.toObject());
        });
      }
    });
  });
}

exports.createUserAndLogin = createUserAndLogin;
exports.Users = UserArray;
