var setupPush = require('./pushSetup.js');
var hookSetup = require('./hooks/hookSetup.js');
var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var pem = require('pem');
var helmet = require('helmet');
var ExpressBrute = require('express-brute');
var MongoStore = require('express-brute-mongo');
var MongoClient = require('mongodb').MongoClient;
var https = require('https');
var http = require('http');
var fs = require('fs');

var cred = require('./conf/credentials');

var app = loopback();

var store = new MongoStore(function (ready) {
  var mongo = cred.get('mongoEast');
  if(!mongo) {
    console.error(new Error('No database found!'));
    //TODO Exit the application
  }
  else {
    var mongodb = 'mongodb://';
    if( mongo.username && mongo.password) {
      mongodb += mongo.username +
        ':' + mongo.password;
    }

    mongodb  += mongo.url;
    mongodb += 'brute';

    if(mongo.replicaSet) {
      mongodb += '?replicaSet=' + mongo.replicaSet;
    }

    //	 console.log('Connecting to ' + mongodb);

    MongoClient.connect(mongodb, function(err, db) {
      if (err) return console.error(err);
      app.bruteDB = db; 
      ready(db.collection('store'));
    });
  }
});

app.brute =  new ExpressBrute(store);
app.debug = require('./logging.js').debug;

if( process.env.NODE_ENV === 'production') {
  app.use(loopback.logger('common'));
} else {
//} else if( process.env.NODE_ENV !== 'staging') {
  app.use(loopback.logger('dev'));
}

//context for use in hooks
app.use(loopback.context());
app.use(loopback.token());
/*
app.use(function setCurrentUser(req, res, next) {
  var where;
  if (!req.accessToken) {
    where = {
      id: 'averageJoe'
    };
  }
  else {
    where = {
      username: req.accessToken.userId
    };
  }

  app.models.Stat.findOne({
    where: where
  }, function(err, stat) {
    if (err) {
      return next(err);
    }
    if (!stat) {
      return next(new Error('No user with this access token was found.'));
    }
    var loopbackContext = loopback.getCurrentContext();
    if (loopbackContext) {
      loopbackContext.set('currentStat', stat);
      //      console.log('Current user stat is set to ' + stat.id);
    }
    next();
  });
});
*/

//Security module
app.use(helmet());

// Compress everything
app.use(loopback.compress());

if( process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  app.use(loopback.static(path.resolve(__dirname, '../common/')));
} else {
  app.use(loopback.static(path.resolve(__dirname, '../client/www/')));
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

//Setup the push server
setupPush(app);
//Setup all the back end hooks
hookSetup(app);

var dataSource;

var onConnected = function() {
  dataSource.autoupdate(function(err) {
    if (err) {
      console.error('Database could not be autoupdated', err);
      //      dataSource.disconnect();
      return;
    }
    console.log('Database autoupdated');
    //    dataSource.disconnect();
  });
};

for(var name in app.dataSources) {
  dataSource = app.dataSources[name];
  dataSource.on('connected', onConnected); 
}

app.start = function() {

  var server;
  var httpOnly = true;
  if( process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    httpOnly = false;
    //Staging and production are done over https
    var options = {
      key: cred.get('sslKey'),
      passphrase: cred.get('sslPassphrase'),
      cert: cred.get('sslCert')
    };

    //Create our https server
    server = https.createServer(options, app);

    server.listen(3443, function() {
      var baseUrl = (httpOnly? 'http://' : 'https://') + app.get('host') + ':' + 3443; 
      app.set('url', baseUrl);
      app.emit('started', baseUrl);
      console.log('Web server listening @ %s%s', baseUrl, '/');
    });
  }

  app.listen(app.get('port'), function() {
    var baseUrl = 'http://' + app.get('host') + ':' + app.get('port'); 
    console.log('Web server listening @ %s%s', baseUrl, '/');
    app.emit('started');
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}

//export the app for testing
exports = module.exports = app;
