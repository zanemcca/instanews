
var fs = require('fs');
var path = require('path');

var crypt = require('./.credentials/crypt.js');
var encrypt = crypt.encrypt;
var decrypt = crypt.decrypt;

function readFile(name) {
  return fs.readFileSync(
     path.resolve(__dirname, name),
     'UTF-8'
  );
}

var apnsCert = readFile('.credentials/apnsCertDev.pem.crypt');
module.exports.apnsCert = decrypt(apnsCert);

var apnsKey = readFile('.credentials/apnsKeyDev.pem.crypt');
module.exports.apnsKey = decrypt(apnsKey);

var gcmServerApiKey = readFile('.credentials/gcmServerApiKey.crypt');
module.exports.gcmServerApiKey = decrypt(gcmServerApiKey);

var mongoEast = readFile('.credentials/mongoEast.crypt');
module.exports.mongoEast = decrypt(mongoEast);

var aws = readFile('.credentials/aws.crypt');
module.exports.aws = decrypt(aws);

if( true ) {
  console.log('apnsCert: ' + module.exports.apnsCert); 
  console.log('apnsKey: ' + module.exports.apnsKey); 
  console.log('gcmServerApiKey: ' + module.exports.gcmServerApiKey); 
  console.log('mongoEast: ' + JSON.stringify(module.exports.mongoEast)); 
  console.log('aws: ' + JSON.stringify(module.exports.aws)); 
}
