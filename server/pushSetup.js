

/* istanbul ignore next */

module.exports = function (app) {
  // Setup push notifications
  var App = app.models.app;
  var Push = app.models.push;
  var Votes = app.models.votes;
  var appName = 'instanews';
  var username = 'zanemcca';

  if ( process.env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'staging' ) 
    {
      var cred = require('./conf/credentials');
      var google = require('google-oauth-jwt');

      var apnsCertData = cred.get('apnsCert');
      var apnsKeyData = cred.get('apnsKey');

      var googleCred = cred.get('google');

      var googleOptions = {
        email: googleCred.client_email,
        scopes: [
          'https://www.googleapis.com/auth/pubsub'
        ],
        key: googleCred.private_key
      }; 

      var gcm = {
        serverApiKey: null,
      };

      var apns = {
        certData: apnsCertData,
        keyData: apnsKeyData,
        pushOptions: {
          //Could add aditional options in here
        },
        feedbackOptions: {
          batchFeedback: true,
          interval: 300
        }
      };

      var registrationOptions = {
        description: 'Local Citizen Journalism',
        pushSettings: {
          apns: apns,
          gcm: gcm
        }
      };

      var refreshTokens = function () {
        google.authenticate(googleOptions, function (err, token) {
          if(err) {
            console.error(err.stack);
          } else {
            gcm.serverApiKey = token; 
            updateOrCreateApp(function(err) {
              if(err) {
                console.error(err.stack);
              } else {
                console.log('Successfully updated the application');
              }
            });
          }
        });
      };

      var startPushServer = function () {
        refreshTokens();
        // get a new token as the old one will expire in 5 minutes 
        setInterval(function () {
          refreshTokens();
        }, 1000*60*55);
      };

      var registerApp = function(cb) {
        Push.on('error', function (err) {
          console.error('Push Notification error: ', err.stack);
        });

        App.observe('before save', function(ctx, next) {
          var inst = ctx.instance;
          if( inst) {
            inst.id = appName;
          }
          next();
        });


        App.register(username, appName, registrationOptions,function(err, app) {
          if (err) {
            console.log('Error Registering app: ' , err);
          }
          else {
            console.log('Registering application: ' + app.id);
          }
        });
      };

      var updateOrCreateApp = function(cb) {
        App.findOne({
          where: { id: appName }
        },
        function (err, result) {
          if (err) {
            cb(err);
          } else if (result) {
            console.log('Updating application: ' + result.id);
            result.updateAttributes(registrationOptions, cb);
          } else {
            return registerApp(cb);
          }
        });
      };

      startPushServer();
    }
};
