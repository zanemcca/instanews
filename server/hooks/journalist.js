
var LIMIT = 10;
// A black list of regexps that match invalid usernames
var blacklist = {
  usernames: [ /instanews/, /^anonymous$/, /^someone$/, /^admin/, /admin$/]
};

module.exports = function(app) {

  var loopback = require('loopback');
  var async = require('async');
  var uuid = require('node-uuid');

  var Journalist = app.models.journalist;

  if(process.env.NODE_ENV === 'production') {
    Journalist.settings.emailVerificationRequired = true;
  } else {
    Journalist.settings.emailVerificationRequired = false;
  }

  var Stat = app.models.stat;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  var debug = app.debug('hooks:journalist');

  Journalist.afterRemote('prototype.__get__articles', function(ctx, instance, next) {
    debug('afterRemote __get__articles', ctx, instance, next);
    //Automatically remove all duplicate articles
    //Duplicates can be present since the articles associated
    //with a journalist come through their subarticles
    var uniqueIds = [];
    for(var i = 0; i < instance.length; i++) {
      if(uniqueIds.indexOf(instance[i].id) > -1 ) {
        instance.splice(i,1);
        i--;
      }
      else {
        uniqueIds.push(instance[i].id);
      }
    }

    next();
  });

  Journalist.afterRemoteError('login', function(ctx, next) {
    var dd = app.DD('Journalist', 'afterLoginError');
    dd.increment('Journalist.error');
    debug('afterRemoteError login', ctx, next);
    app.brute.prevent(ctx.req, ctx.res, function() {
      next();
    });
  });

  Journalist.afterRemoteError('confirm', function (ctx,next) {
    var dd = app.DD('Journalist', 'afterConfirmError');
    dd.increment('Journalist.error');
    debug('afterRemoteError confirm', ctx);
    app.brute.prevent(ctx.req, ctx.res, function() {
      next();
    });
  });


  //Override the old User.confirm function to accept both username and email
  var oldConfirm = Journalist.confirm;
  Journalist.confirm = function(uid, token, redirect, fn) {
    if(uid.indexOf('@') > -1) {
      Journalist.findOne({ where: { email: uid }}, function(err, res) {
        if(err) {
          return fn(err);
        }
        if(res) {
          oldConfirm.call(Journalist, res.username, token, redirect, fn);
        } else {
          err = new Error('Failed to find a journalist: ' + uid);
          err.status = 404;
          fn(err);
        }
      });
    } else {
      oldConfirm.call(Journalist, uid, token, redirect, fn);
    }
  };

  Journalist.beforeRemote('create', function(ctx, instance, done) {
    var dd = app.DD('Journalist','beforeCreate');
    debug('beforeRemote create', ctx, instance, done);
    // var excTime = Date.now();
    var next = function (err) {
      // excTime = Date.now() - excTime;
      //    app.dd.timing('journalist.create.timing',excTime); //Execution time in ms
      done(err);
    };

    var user, e;
    if( ctx && ctx.req && ctx.req.body) {
      user = ctx.req.body;
    }
    else if( instance ) {
      user = instance;
    }
    else {
      e = new Error('Bad user given for creation!');
      e.status = 422;
      next(e);
    }

    function checkPasswordStrength(password) {
      var p = password;
      var strength = 0;

      // istanbul ignore if
      if( !p || p.length === 0 ) {
        strength = 0;
      }
      else if (p.length < 8) {
        strength = -1;
      }
      else {
        //lowercase && (numbers || uppercase || special)
        var strong = /^(?=.*[a-z])((?=.*[A-Z])|(?=.*\d)|(?=.*[-+_!@#$%^&*.,?~])).+$/;
        //lowercase && 2 of (numbers || uppercase || special)
        var excellent = /^(?=.*[a-z])(((?=.*[A-Z])(?=.*\d))|((?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?~]))|((?=.*\d)(?=.*[-+_!@#$%^&*.,?]))).+$/;
        if (excellent.test(p) || (p.length >= 12 && strong.test(p))) {
          strength = 3;
        }
        else if (strong.test(p) || p.length >= 12) {
          strength = 2;
        }
        else {
          strength = 1;
        }
      }

      return strength;
    } 

    if(typeof(user.password) === 'number') {
      user.password = user.password.toString();
    }

    if(user.username) {
      if(typeof user.username !== 'string') {
        user.username = user.username.toString();
      }
      user.username = user.username.toLowerCase();
    }
    if(user.email) {
      user.email = user.email.toLowerCase();
    }

    function validUsername(username, cb) {
      var valid =  /^[a-z0-9_-]{3,16}$/;
      if(valid.test(username)) {
        for(var i in blacklist.usernames) {
          if(blacklist.usernames[i].test(username)) {
            return cb(false);
          }
        }

        // Check for profanity
        app.moderator.check(username)
        .then(function(profanity) {
          dd.lap('Moderator.check');
          cb(!profanity);
        });
      } else {
        return cb(false);
      }
    }

    if(checkPasswordStrength(user.password) <= 0) {
      e = new Error('Password is too weak!');
      e.status = 422;
      next(e);
    }
    else {
      validUsername(user.username, function(valid) {
        if(valid) {
          Journalist.count({
            or: [{
              email: user.email
            },
            {
              username: user.username
            }]
          }, function(err, count) {
            dd.lap('Journalist.count');
            if( err) {
              next(err);
            }
            else if(count === 0) {
              user.uniqueId = uuid.v4();
              next();
            }
            else {
              var er = new Error('Username or email is already used!'); 
              er.status = 403;
              next(er);
            }
          });
        } else {
          e = new Error('Username is invalid!');
          e.status = 403;
          next(e);
        }
      });
    }
  });

  Journalist.afterRemote('create', function(ctx, user, next) {
    var dd = app.DD('Journalist','afterCreate');
    debug('after create', user, next);
    Journalist.sendConfirmation(user, function(err) {
      dd.lap('Journalist.sendConfirmation');
      next(err);
    });
  });

  Journalist.observe('access', function(ctx, next) {
    debug('access', ctx, next);

    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
      ctx.query.limit = LIMIT;
    }
    next();
  });

  var checkLoadedUser = function (instance, next) {
    var dd = app.DD('Journalist','checkLoadedUser');
    var userId;
    var includeSecrets = false;

    var done = function () {
      if(!includeSecrets) {
        instance.unsetAttribute('email');
        instance.unsetAttribute('uniqueId');
      } else {
        //TODO This Read-Modify-Write operation is not Atomic
        // Adds a uniqueId to the user if they are missing it
        if(!instance.uniqueId) {
          instance.setAttribute('uniqueId', uuid.v4());
          return instance.save(function (err) {
            dd.lap('Journalist.save');
            if( err) {
              console.error('Failed to create a uniqueId!');
              console.error(err.stack);
            }
            next(err);
          });
        }
      }
      next();
    };

    var check = function () {
       if(userId === instance.username) {
         includeSecrets = true;
       } else {
         //find by query can be used to discover the user behind a uniqueId or email
         if (!instance.findById) {
           instance.unsetAttribute('username');
           instance.setAttribute('used', true);
         }
       }

      //Only admins can see who else is an admin
      Role.isInRole('admin', {
        principalType: RoleMapping.USER,
        principalId: userId 
      }, function(err, exists) {
        dd.lap('Role.isInRole');
        if(exists) {
          Role.isInRole('admin', {
            principalType: RoleMapping.USER,
            principalId: instance.username
          }, function(err, exists) {
            dd.lap('Role.isInRole');
            if(exists) {
              instance.isAdmin = true;
            }
            done();
          });
        } else {
          done();
        }
      });
    };

    var context = loopback.getCurrentContext();

    if(context) {
      var token = context.get('accessToken');
      if(token) {
        userId = token.userId;
        if(userId) {
          return check();
        }
      }
    }

    if (!instance.findById) {
      instance.unsetAttribute('username');
      instance.setAttribute('used', true);
    } else {
      instance.unsetAttribute('findById');
    }

    done();
  };

  Journalist.afterRemote('findById', function(ctx, instance, next) {
    var dd = app.DD('Journalist','afterFindById');
    debug('afterRemote findById', instance, next);

    if(instance) {
      instance.findById = true;
      checkLoadedUser(instance, function(err) {
        dd.lap('Journalist.checkLoadedUser');
        next(err);
      });
    } else {
      next();
    }
  });

  Journalist.afterRemote('findOne', function(ctx, instance, next) {
    var dd = app.DD('Journalist','afterFindOne');
    debug('afterRemote findOne', instance, next);

    if(instance) {
      checkLoadedUser(instance, function(err) {
        dd.lap('Journalist.checkLoadedUser');
        next(err);
      });
    } else {
      next();
    }
  });

  //TODO Test this and use it if we ever open up Journalist.find
  Journalist.afterRemote('find', function(ctx, instances, next) {
    var dd = app.DD('Journalist','afterFind');
    debug('afterRemote find', instances, next);

    if(instances.length) {
      var funcs = [];
      instances.forEach( function (instance) {
        funcs.push(function(cb) {
          checkLoadedUser(instance, function(err) {
            dd.elapsed('Journalist.checkLoadedUser');
            cb(err);
          });
        });
      });
      async.parallel(funcs, function(err) {
        next(err);
      });
    } else {
      next();
    }
  });
};
