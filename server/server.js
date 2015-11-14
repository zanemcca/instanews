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
var fs = require('fs');
var debounce = require('debounce');
var http;

var dd = require('node-dogstatsd').StatsD;

var cred = require('./conf/credentials');

var app = loopback();

var datadogHost = 'localhost';
for(var i in process.env) {
  if(i.match(/^DATADOG_\d_ENV_TUTUM_NODE_HOSTNAME$/)) {
    if(process.env[i] === process.env.TUTUM_NODE_HOSTNAME) {
      var num = i[8];
      var env = 'DATADOG_' + num + '_ENV_TUTUM_CONTAINER_HOSTNAME';
      env  = process.env[env];

      if(env) {
        datadogHost = env;
        break;
      } else {
        console.error('Environment variable ' + env + ' not valid!');
      }
    }
  }
}

console.log('Connecting statsd to ' + datadogHost);
app.dd = new dd(datadogHost, 8125);

var datadog = require('connect-datadog')({ 
  dogstatsd: app.dd,
  response_code: true,
  method: true,
  protocol: true,
  base_url: true,
  tags: ['app:instanews']
});

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

    //console.log('Connecting to ' + mongodb);

    MongoClient.connect(mongodb, function(err, db) {
      if (err) {
        console.log('Brute has failed to connect to mongo');
        return console.error(err);
      }
      app.bruteDB = db; 
      ready(db.collection('store'));
    });
  }
});

app.brute =  new ExpressBrute(store);
app.debug = require('./logging.js').debug;

if( process.env.NODE_ENV === 'production') {
  /*
     var loggerFmt = 'method: :method,,' +
     'url: :url,,' +
     'status: :status,,' +
     'responseTime :response-time ms,,'+
     'length: :res[content-length],,' +
     'remoteAddr: :remote-addr,,' +
     'referrer: :referrer,,' +
     'HTTP: :http-version,,' +
     'user-agent: :user-agent';

     app.use(loopback.logger(loggerFmt));
     */
  //} else {
  } else if( process.env.NODE_ENV !== 'staging') {
    app.use(loopback.logger('dev'));
  }

  //context for use in hooks
  app.use(loopback.context());
  app.use(loopback.token());

  // istanbul ignore next
  var logConnections = debounce(function () {
    if(app.dd && http) {
      app.dd.histogram('app.connections', http.connections);
    }
  }, 10);

  app.use(function log (req, res, next) {
    logConnections();
    next();
  });

  //Security module
  app.use(helmet());

  // Compress everything
  app.use(loopback.compress());

  app.use(datadog);

  // istanbul ignore if
  if( process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
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

  var onConnected = function(dataSource) {
    dataSource.autoupdate(function(err) {
      // istanbul ignore if
      if (err) {
        console.error('Database could not be autoupdated');
        console.error(err);
        process.exit(-1);
        //      dataSource.disconnect();
        return;
      }
      console.log('Database autoupdated');
      //    dataSource.disconnect();
    });
  };

  var dataSource;

  for(var name in app.dataSources) {
    dataSource = app.dataSources[name];
    dataSource.on('connected', onConnected.bind(onConnected, dataSource)); 
  }

  app.start = function() {

    var server;
    var httpOnly = true;
    // istanbul ignore if
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

    http = app.listen(app.get('port'), function() {
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
