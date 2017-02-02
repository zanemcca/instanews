
function validate(options) {
  return options && options.to && options.subject && options.text;
}

/*
if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  var cred = require('../conf/credentials').get('sendgrid');

  var sendgrid = require('sendgrid')(cred.apikey);
  var Contacts = require('sendgrid-contacts')(cred.apikey);

  var send = function (options, cb) {
    if(validate(options)) {
      options.from = options.from || 'error@instanews.com';
      sendgrid.send(options, function(err, json) {
        if(err) {
          console.error('Failed to send email!');
          console.dir(err);
          cb(err);
        } else {
          console.log('Sent email!');
          cb();
        }
      });
    } else {
      console.error('Malformed email!');
      console.dir(options);
      cb('Malformed Email!');
    }
  }; 

  var register = function(data, cb) {
    //Sendgrid has a limit of 1.5 req/sec but we can batch up to 1500 recipients in one request
    //TODO Defer the addition by placing the email into redis
    Contacts.recipients.addRecipients([data], cb);
  };

  exports.email = {
    register: register,
    send: send
  };
} else {

 */
  exports.email = {
    send: function(opts, cb) {
      if(validate(options)) {
        console.log('Fake email send!');
        console.dir(opts);
        cb();
      } else {
        console.error('Fake email invalid!');
        console.dir(opts);
        cb('Malformed Email!');
      }
    },
    register: function(data, cb) {
      console.log('Fake email registration!');
      console.dir(data);
      cb();
    }
  };
//}
