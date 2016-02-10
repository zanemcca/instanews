
var cred = require('./conf/credentials');

var sendgrid = cred.get('sendgrid');
var mongo = cred.get('mongo');
var mongoCA = cred.get('mongoCA');
var aws = cred.get('aws');

if( !mongo ) {
  return process.exit(1);
}

var mongodb = 'mongodb://';
if( mongo.username && mongo.password) {
  mongodb += mongo.username +
  ':' + mongo.password;
}

mongodb  += mongo.url;

var options = '?connectTimeoutMS=30000';
if(mongo.replicaSet) {
  options += '&replicaSet=' + mongo.replicaSet;
}

var mongos;

if(mongo.ssl && mongoCA) {
  mongos = {
    ssl: true,
    sslValidate: true,
    sslCA: [mongoCA],
  };
}

var maxFileSize = 1024*1024*1024; //1Gb

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  Installations: {
    url: mongodb + 'installations' + options,
    database: 'installations',
    name: 'Installations',
    connector: 'mongodb',
    mongos: mongos,
    debug: false 
  },
  Interactions: {
    url: mongodb + 'interactions' + options,
    database: 'interactions',
    name: 'Interactions',
    connector: 'mongodb',
    mongos: mongos,
    debug: false
  },
  /*
  Notifications: {
    url: mongodb + 'notifications' + options,
    database: 'notifications',
    name: 'Notifications',
    connector: 'mongodb',
    debug: false
  },
 */
  Articles: {
    url: mongodb + 'articles' + options,
    database: 'articles',
    name: 'Articles',
    connector: 'mongodb',
    mongos: mongos,
    debug: false
  },
  Admins: {
    url: mongodb + 'admins' + options,
    database: 'admins',
    name: 'Admins',
    connector: 'mongodb',
    mongos: mongos,
    debug: false
  },
  Users: {
    url: mongodb + 'users' + options,
    database: 'users',
    name: 'Users',
    connector: 'mongodb',
    mongos: mongos,
    debug: false
  },
  push: {
    name: 'push',
    connector: 'loopback-component-push',
    installation: 'installation',
    notification: 'notification',
    application: 'app'
  },
  sendgrid: {
    connector: 'loopback-connector-sendgrid',
    api_user: sendgrid.user,
    api_key: sendgrid.key 
  },
  Storage: {
    name: 'Storage',
    connector: 'loopback-component-storage',
    provider: 'amazon',
    maxFileSize: maxFileSize,
    key: aws.key ,
    keyId: aws.keyId
  }
};
