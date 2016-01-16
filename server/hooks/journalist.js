
var LIMIT = 10;

module.exports = function(app) {

  var Journalist = app.models.journalist;

  if(process.env.NODE_ENV === 'production') {
    Journalist.settings.emailVerificationRequired = true;
  } else {
    Journalist.settings.emailVerificationRequired = false;
  }

  var Stat = app.models.stat;
  var debug = app.debug('hooks:journalist');

  Journalist.afterRemote('prototype.__get__articles',
      function(ctx, instance, next) {
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
    app.dd.increment('journalist.login.error');
    debug('afterRemoteError login', ctx, next);
    app.brute.prevent(ctx.req, ctx.res, function() {
      next();
    });
  });

  Journalist.afterRemoteError('confirm', function (ctx,next) {
    app.dd.increment('journalist.confirm.error');
    debug('afterRemoteError confirm', ctx);
    app.brute.prevent(ctx.req, ctx.res, function() {
      next();
    });
  });

  Journalist.beforeRemote('create', function(ctx, instance, done) {
    debug('beforeRemote create', ctx, instance, done);
    // var excTime = Date.now();
    var next = function (err) {
      // excTime = Date.now() - excTime;
      //    app.dd.timing('journalist.create.timing',excTime); //Execution time in ms
      done(err);
    };

    var user;
    if( ctx && ctx.req && ctx.req.body) {
      user = ctx.req.body;
    }
    else if( instance ) {
      user = instance;
    }
    else {
      next(new Error('Bad user given for creation!'));
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
    }; 

    user.username.toLowerCase();

    function validUsername(username) {
      var valid =  /^[a-z0-9_-]{3,16}$/;
      return valid.test(username);
    };

    if(checkPasswordStrength(user.password) <= 0) {
      var e = new Error('Password is too weak!');
      e.status = 403;
      next(e);
    }
    else {
      if(validUsername(user.username)) {
        Journalist.count({
          or: [{
                email: user.email
              },
          {
            username: user.username
          }]
        }, function(err, count) {
          if( err) {
            next(err);
          }
          else if(count === 0) {
            next();
          }
          else {
            var er = new Error('Username or email is already used!'); 
            er.status = 403;
            next(er);
          }
        });
      } else {
        var e = new Error('Username is invalid!');
        e.status = 403;
        next(e);
      }
    }
  });

  Journalist.afterRemote('create', function(ctx, user, next) {
    debug('after create', user, next);
    Journalist.sendConfirmation(user, next);
  });

  Journalist.observe('access', function(ctx, next) {
    debug('access', ctx, next);

    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
      ctx.query.limit = LIMIT;
    }
    next();
  });

};
