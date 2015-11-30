
var common = require('./common');

module.exports = function(Journalist) {

  var path = require('path');
  var crypto = require('crypto');

  function randomToken(len) {
    if(!len) {
      len = 6;
    }

    var buf = crypto.randomBytes(len);
    var res = '';
    for(var i in buf) {
      res += buf[i].toString(10);
      if(res.length >= len) {
        return res.slice(0,len);
      }
    }
    console.log('Error: Failed to create a randomToken');
  }

  Journalist.sendConfirmation = function (user, next) {
    var options = {
      type: 'email',
      to: user.email,
      from: 'noreply@instanews.com',
      //redirect: '/',
      //protocol: ctx.req.protocol,
      //host: '192.168.1.9',
      subject: 'Verify Your Email Address',
      template: path.resolve(__dirname, '../views/verify.ejs'),
      generateVerificationToken: function (user, cb) {
        var token = randomToken(6);
        cb(null, token);
      }
    };

    user.verify(options, function(err, res) {
      if( err) {
        console.error('Error: Failed to verify the email ' + user.email);
        console.error(err.stack);
        next(err);
      }
      else {
        next();
      }
    });
  }; 

  Journalist.resendConfirmation = function (user, next) {
    var query = {
      where: {}
    };

    if(!user || !(user.email || user.username)) {
      var e = new Error('The user is invalid');
      e.status = 422;
      return next(e);
    }
    if(user.email) {
      query.where.email = user.email;
    } else {
      query.where.username = user.username;
    }

    Journalist.findOne(query, function (err, res) {
      if(err) {
        return next(err);
      }
      if(!res) {
        err = new Error('There is no user under that search');
        err.status = 404;
        return next(err);
      } else {
        if(res.__data.emailVerified) {
          err = new Error('This users email is already verified: ' + res.username);
          err.status = 403;
          return next(err);
        } else {
          Journalist.sendConfirmation(res, next);
        }
      }
    });
  };

  Journalist.requestPasswordReset = function (user, next) {
    var query = {
      where: {}
    };

    if(!user || !(user.email || user.username)) {
      var e = new Error('The user is invalid');
      e.status = 422;
      return next(e);
    }
    if(user.email) {
      query.where.email = user.email;
    } else {
      query.where.username = user.username;
    }

    Journalist.findOne(query, function (err, res) {
      if(err) {
        return next(err);
      }
      if(!res) {
        err = new Error('There is no user under that search');
        err.status = 404;
        return next(err);
      } else {
        var options = {
          to: user.email,
          generateVerificationToken: function (user, cb) {
            var token = randomToken(6);
            cb(null, token);
          }
        };

        res.requestPasswordReset(options, function(err, res) {
          if( err) {
            console.error('Error: Failed to verify the email ' + user.email);
            console.error(err.stack);
            next(err);
          }
          else {
            next();
          }
        });
      }
    });
  };

  Journalist.on('resetPasswordRequest', function (info) {
    //TODO randomToken does not set the accesstoken at all
    //  Solve by adding generateAccessToken function to options of resetPassword
    var html = '<p>Password reset code: <b>' + info.accessToken.id + '</b></p>';
    Journalist.app.models.Email.send({
      to: info.email,
      from: 'noreply@instanews.com',
      subject: 'Password Reset',
      html: html
    }, function (err) {
      if (err) {
        console.error(err.stack);
      } else {
        console.log('Successful password reset email sent');
      }
    });
  });

  Journalist.remoteMethod(
    'resendConfirmation',
    {
      accepts: { arg: 'user', type: 'object', required: true}
    }
   );

  Journalist.remoteMethod(
    'requestPasswordReset',
    {
      accepts: { arg: 'user', type: 'object', required: true}
    }
   );

   var staticDisable = [
      'exists',
      'find',
 //     'findOne',
      'upsert',
      'prototype.updateAttributes',
      'deleteById',
 //     'confirm',
 //     'resetPassword',
      'createChangeStream',
      'createChangeStream_0',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable most accessToken REST endpoints
      '__get__accessTokens',
      '__delete__accessTokens',
      '__destroyById__accessTokens',
      '__findById__accessTokens',
      '__updateById__accessTokens',
      '__count__accessTokens',
      //disable most articles REST endpoints
      '__delete__articles',
      '__destroyById__articles',
      '__findById__articles',
      '__create__articles',
      '__updateById__articles',
      '__count__articles',
      '__unlink__articles',
      '__link__articles',
      '__exists__articles',
      //disable all installation REST endpoints
      '__get__installations',
      '__delete__installations',
      '__destroyById__installations',
      '__findById__installations',
      '__create__installations',
      '__updateById__installations',
      '__count__installations',
      //disable most notification REST endpoints
      '__delete__notifications',
      '__destroyById__notifications',
      '__findById__notifications',
      '__create__notifications',
      '__count__notifications',
      //disable all subarticle REST endpoints
      '__get__subarticles',
      '__delete__subarticles',
      '__destroyById__subarticles',
      '__findById__subarticles',
      '__create__subarticles',
      '__updateById__subarticles',
      '__count__subarticles',
      //disable all stat REST endpoints
      '__get__stats',
      '__destroy__stats',
      '__create__stats',
      '__update__stats',
      //disable all clicks REST endpoints
      '__get__clicks',
      '__delete__clicks',
      '__destroyById__clicks',
      '__findById__clicks',
      '__create__clicks',
      '__updateById__clicks',
      '__count__clicks',
      //disable all upVotes REST endpoints
      //'__get__upVotes',
      '__delete__upVotes',
      '__destroyById__upVotes',
      '__findById__upVotes',
      '__create__upVotes',
      '__updateById__upVotes',
      '__count__upVotes',
      //disable all downVotes REST endpoints
      //'__get__downVotes',
      '__delete__downVotes',
      '__destroyById__downVotes',
      '__findById__downVotes',
      '__create__downVotes',
      '__updateById__downVotes',
      '__count__downVotes',
      //disable all views REST endpoints
      '__get__views',
      '__delete__views',
      '__destroyById__views',
      '__findById__views',
      '__create__views',
      '__updateById__views',
      '__count__views'
   ];

   common.disableRemotes(Journalist,staticDisable,true);
   common.disableRemotes(Journalist,nonStaticDisable,false);

};
