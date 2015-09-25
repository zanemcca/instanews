
/* jshint expr: true */

var async = require('async');
var depend = require('./depend');
var on = depend.On();

var common = require('../common');
var app = common.app;

var chai = require('chai');
var expect = chai.expect;

var thunk = require('./thunk');

function checkDb(cb, not) {
  checkDb2(on.Instances.get(), function (err) {
    Instances = on.Instances.get().slice(0);
    if(err) cb(err);
    checkDb2(on.Users.get(), function (err) {
      Users = on.Users.get().slice(0);
      cb(err);
    }, not);
  }, not);
}

function checkDb2(instances, cb, not) {
  var Model, DataSource;

  function checkChildrenCb(err) {
    if (err) return cb(err);
    Model.findById(inst.id, complete);
  }

  var completed = 0;
  function complete(err, res) {
    var pass = res;
    if(not) {
      pass = !res;
    }

    if(!pass || err) {
      stop();
      expect(err).to.not.exist;
      expect(pass).to.be.true;
    } else {
      completed++;
    }
  }

  for(var inst of instances) {
    var name = inst.modelName;
    var id = inst.id;
    if(!name) {
      if(inst.userId) {
        name = 'journalist';
        id = inst.userId;
      } else {
        name = 'view';
      }
    }

    if( app.models.hasOwnProperty(name)) {
      Model = app.models[name];
      if(inst.children) {
        checkDb2(inst.children, checkChildrenCb, not);
      } else {
        Model.findById(id, complete);
      }
    } else {
      var e = new Error('Failed to find '+ name + ' on app.models');
      e.status = 400;
      stop();
      return cb(e);
    }
  }

  function stop() {
    clearTimeout(timer);
  }

  function wait(time) {
    return setTimeout(function () { 
      if(completed >= instances.length) {
        cb();
      } else {
        timer = wait(time * 2); //Double the wait time every iteration
      }
    }, time);
  }

  var timer = wait(1);
}

var Instances = [];
var Users = [];
var names = [
  'article',
  'subarticle',
  'comment',
  'upVote',
  'downVote',
//  'view',
//  'click' TODO delete clicks within depend.js
  //  They are both created passively by the server so tracking 
  //  them in depend.js is not really convenient
];

var purge = function(done) {
  var funcs = [];
  var func = function(model) {
    return function (cb) {
      model.destroyAll(cb);
    };
  };

  for(var name of names) {
    var model = app.models[name];
    if(model) {
      funcs.push(func(model));
    } else {
      console.log('Could not purge ' + name);
    }
  }

  async.parallel(funcs, function(err, res) {
    done(err);
  });
};

var verifyPurge = function(done) {
  var funcs = [];
  var func = function(model) {
    return function (cb) {
      model.count(function(err, res) {
        if(res > 0) {
          console.log(model.definition.name);
        }
        expect(res).to.equal(0);
        cb(err);
      });
    };
  };

  for(var name of names) {
    var model = app.models[name];
    if(model) {
      funcs.push(func(model));
    } else {
      console.log('Could not purge ' + name);
    }
  }

  async.parallel(funcs, function(err, res) {
    done(err);
  });
};

describe('Depend', function () {
  before(function(done) {
    this.timeout(10000);
    setTimeout(done, 5000);
  });

  describe('on', function () {
    this.timeout(10000);
    before(function (done) {
      purge(done);
    });

    after(function (done) {
      verifyPurge(done);
    });

    afterEach(function (done) {
      checkDb2(Instances, function (err) {
        if(err) done(err);
        checkDb2(Users, done, true);
      }, true);
    });

    describe('by("username")', function () {
      on.article().by('bob').describe('checking creation ', function () {
        it('should post an article by bob', function () {
          var art = on.Instances.getActionableInstance();
          expect(art).to.exist;
          expect(art.username).to.equal('bob');
        });
      });
    });

    describe('article()', function () {
      on.article().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });
    });

    describe('subarticle()', function () {
      on.subarticle().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.subarticle().on.article().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.subarticle().plus.comment().on.article().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.subarticle().on.article().plus.comment().describe('Checking creation', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.subarticle().on.article().plus.subarticle().describe('Checking creation', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });
    });

    describe('comment()', function () {
      on.comment().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.article().describe('checking creation', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.subarticle().describe('checking creation', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.subarticle().on.article().describe('checking creation', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.comment().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.comment().on.article().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.comment().on.subarticle().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });

      on.comment().on.comment().on.subarticle().on.article().describe('checking creation ', function () {
        it('should work!', function (done) {
          checkDb(done);
        });
      });
    });
  });
});
