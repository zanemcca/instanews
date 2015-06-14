
var cred = require('./conf/credentials');

var mongo = cred.get('mongoEast');
console.log(mongo);
var aws = cred.get('aws');
console.log(aws);

var mongodb = 'mongodb://'+
  mongo.username + ':' +
  mongo.password +
  '@c1067.candidate.11.mongolayer.com:11067,candidate.16.mongolayer.com:11088/';

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  Installations: {
    url: mongodb + 'installations?replicaSet=set-5578a889078f19c579000f45',
    database: 'installations',
    name: 'Installations',
    connector: 'mongodb',
    debug: true
  },
  Notifications: {
    url: mongodb + 'notifications?replicaSet=set-5578a889078f19c579000f45',
    database: 'notifications',
    name: 'Notifications',
    connector: 'mongodb',
    debug: true
  },
  Articles: {
    url: mongodb + 'articles?replicaSet=set-5578a889078f19c579000f45',
    database: 'articles',
    name: 'Articles',
    connector: 'mongodb',
    debug: true
  },
  Users: {
    url: mongodb + 'users?replicaSet=set-5578a889078f19c579000f45',
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
    key: aws.key ,
    keyId: aws.keyId
  }
};
