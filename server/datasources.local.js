
var cred = require('./conf/credentials');

var sendgrid = cred.get('sendgrid');
var mongo = cred.get('mongo');

if( !mongo ) {
  return process.exit(1);
}

var mongodb = 'mongodb://';
if( mongo.username && mongo.password) {
  mongodb += mongo.username +
  ':' + mongo.password;
}

mongodb  += mongo.url;

console.log('MongoUrl: ' + mongodb);

var options = '?connectTimeoutMS=30000';
if(mongo.replicaSet) {
  options += '&replicaSet=' + mongo.replicaSet;
}

var mongos;

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
    debug: true
  },
  Interactions: {
    url: mongodb + 'interactions' + options,
    database: 'interactions',
    name: 'Interactions',
    connector: 'mongodb',
    mongos: mongos,
    debug: true
  },
  /*
  Notifications: {
    url: mongodb + 'notifications' + options,
    database: 'notifications',
    name: 'Notifications',
    connector: 'mongodb',
    debug: true
  },
 */
  Articles: {
    url: mongodb + 'articles' + options,
    database: 'articles',
    name: 'Articles',
    connector: 'mongodb',
    mongos: mongos,
    allowExtendedOperators: true,
    debug: true
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
    mongos: mongos,
    allowExtendedOperators: true,
    connector: 'mongodb'
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
    provider: 'filesystem',
    maxFileSize: maxFileSize,
    root: './test/.storage'
  }
};
