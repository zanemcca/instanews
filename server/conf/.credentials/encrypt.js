
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');

var crypt = require('./crypt.js');
var encrypt = crypt.encrypt;
var decrypt = crypt.decrypt;

var password;

function readFile(name) {
  return fs.readFileSync(
     path.resolve(__dirname, './unencrypted/' + name),
     'UTF-8'
  );
}

var writeFile = function(filename, contents) {
  return fs.writeFileSync(
     path.resolve(__dirname, filename),
     contents,
     'UTF-8'
  );
};

var encryptFile = function(filename) {

  var file = readFile(filename);
  if( file ) {
    var cipher = encrypt(file, password);

    filename += '.crypt';
    console.log('Writing file: ' + filename);
    writeFile(filename , cipher);
  }
  else {
    console.err('File ' + filename + ' was not found!');
  }
};

var encryptObject = function(filename, object) {
    var cipher = encrypt(object, password);
    filename += '.crypt';
    console.log('Writing file: ' + filename);
    writeFile(filename , cipher);
};

prompt.start();

prompt.get([
  {
    name: 'password',
    validator: /(?=.*\d)(?=.*[a-z]).{12,}/,
    hidden: true,
    warning: 'Passwords must be at least 12 characters ' + 
    'long and contain at least 1 number and 1 lowercase character!'
  }], function(err, res) {
  if (err) {
    console.error(err);
  }

  console.log(res);
  password = res.password;

  encryptFile('apnsCertDev.pem');
  encryptFile('apnsKeyDev.pem');
 
  prompt.get(['gcmServerApiKey'], function(err, res) {
    if (err) {
      console.error(err);
    }

    console.log('gcmServerApiKey is ' + res.gcmServerApiKey);
    encryptObject('gcmServerApiKey', res.gcmServerApiKey);

    console.log('MongoEast Credentials:');
    prompt.get([
      {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes'
      },
      {
        name: 'password',
        validator: /(?=.*\d)(?=.*[a-z]).{12,}/,
        warning: 'Passwords must be at least 12 characters ' + 
        'long and contain at least 1 number and 1 lowercase character!',
        hidden: true
      }], function(err, res) {
      if (err) {
        console.error(err);
      }
      encryptObject('mongoEast', res);

      console.log('AWS Credentials:');
      prompt.get([
        {
          name: 'key',
          hidden: true
        },
        {
          name: 'keyId',
          hidden: true
        }], function(err, res) {
        if (err) {
          console.error(err);
        }

        encryptObject('aws', res);
      });

    });

  });

});


