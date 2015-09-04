
var cred = require('./conf/credentials');

var mongo = cred.get('mongoEast');
var aws = cred.get('aws');

var mongodb = 'mongodb://';
if( mongo.username && mongo.password) {
  mongodb += mongo.username +
  ':' + mongo.password;
}

mongodb  += mongo.url;

var mongoReplica = '';
if(mongo.replicaSet) {
  mongoReplica = '?replicaSet=' + mongo.replicaSet;
}

var maxFileSize = 1024*1024*1024; //1Gb

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  Installations: {
    url: mongodb + 'installations' + mongoReplica,
    database: 'installations',
    name: 'Installations',
    connector: 'mongodb',
    debug: true
  },
  Interactions: {
    url: mongodb + 'interactions' + mongoReplica,
    database: 'interactions',
    name: 'Interactions',
    connector: 'mongodb',
    debug: true
  },
  Notifications: {
    url: mongodb + 'notifications' + mongoReplica,
    database: 'notifications',
    name: 'Notifications',
    connector: 'mongodb',
    debug: true
  },
  Articles: {
    url: mongodb + 'articles' + mongoReplica,
    database: 'articles',
    name: 'Articles',
    connector: 'mongodb',
    debug: true
  },
  Users: {
    url: mongodb + 'users' + mongoReplica,
    database: 'users',
    name: 'Users',
    connector: 'mongodb'
  },
  push: {
    name: 'push',
    connector: 'loopback-component-push',
    installation: 'installation',
    notification: 'notification',
    application: 'app'
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
