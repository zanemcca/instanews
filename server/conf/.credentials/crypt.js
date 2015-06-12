
var crypto = require('crypto');

var algorithm = 'aes-256-ctr';
var pass = process.env.ENCRYPT_PASSWORD;


module.exports.encrypt = function encrypt(object, password) {

  var text;

  try {
    text = JSON.stringify(object);
  }
  catch(err) {
    console.error(err);
    return false;
  }

  if(!password) password = pass;
  if(!password) return console.log('No password given');

  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
};

 module.exports.decrypt = function decrypt(text, password) {

  if(!password) password = pass;
  if(!password) return console.log('No password given');

  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');

  var object;

  try {
    object = JSON.parse(dec);
  }
  catch(err) {
    console.error(err);
    return false;
  }

  return object;
};

