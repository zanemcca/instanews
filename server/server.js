
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var loopback = require('loopback');
var Timer = require('./timer.js');
var http,
datadog;


// Utility functions
var ObjectId = require('mongodb').ObjectId;
function objectIdWithTimestamp(timestamp) {
    // Convert string date to Date object (otherwise assume timestamp is a date)
    if (typeof(timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }

    // Convert date object to hex seconds since Unix epoch
    var hexSeconds = Math.floor(timestamp/1000).toString(16);

    // Create an ObjectId with that hex timestamp
    var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId;
}


// istanbul ignore next 
var setupMonitoring = function () {
  // Monitoring only necessary when in production
  if(process.env.NODE_ENV === 'production') {
    var dd = require('node-dogstatsd').StatsD;
    var datadogHost = 'localhost';
    for(var i in process.env) {
      if(i.match(/^DATADOG_\d_ENV_DOCKERCLOUD_NODE_HOSTNAME$/)) {
        if(process.env[i] === process.env.DOCKERCLOUD_NODE_HOSTNAME) {
          var num = i[8];
          var env = 'DATADOG_' + num + '_ENV_DOCKERCLOUD_CONTAINER_HOSTNAME';
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

    datadog = require('connect-datadog')({ 
      dogstatsd: app.dd,
      response_code: true,
      method: true,
      protocol: true,
      base_url: true,
      tags: ['app:instanews']
    });
  } else {
    app.dd = {
      histogram: function () {},
      timing: function () {},
      increment: function () {},
      decrement: function () {}
    };
  }
};

var app = loopback();
setupMonitoring();
app.Timer = Timer.bind(this, app);

app.utils = {
  objectIdWithTimestamp: objectIdWithTimestamp
};

var tooManyDead = numCPUs*3; //Basically 3 tries for each child process 

if(cluster.isMaster && numCPUs > 1 && process.env.NODE_ENV === 'production') {
  var dead = 0;

  var createWorkers = function () {
    var workers = [];
    function find(worker) {
      workers.forEach(function(wrkr) {
        if(wrkr.process.pid === worker.process.pid) {
          return wrkr;
        }
      });
    }
    function add(worker) {
      workers.push(worker);
    }
    function remove(worker) {
      for(var i in workers) {
        if(workers[i].process.pid === worker.process.pid) {
          workers = workers.splice(i,1);
          break;
        }
      }
    }

    return {
      find: find,
      remove: remove,
      add: add
    };
  };

  var workers = createWorkers();

  // Start instance per cpu
  for(var i = 0; i < numCPUs; i++) {
    workers.add(cluster.fork());
  }

  cluster.on('exit', function (worker, code, signal) {
    dead++;
    workers.remove(worker);
    if(['SIGKILL', 'SIGTERM'].indexOf(signal) === -1) {
      console.warn('worker ' + worker.process.pid + ' died (' + code + '). Restarting...');
      app.dd.increment('cluster.worker.died');

      if(dead < tooManyDead) {
        workers.add(cluster.fork());
      } else {
        console.log('\n\n************************************************\n');
        console.log('CRITICAL: Too many (' + dead + ') dead nodes!');
        console.log('Killing Cluster...');
        console.log('\n************************************************\n');

        //TODO Notify nodes to gracefully shutdown
        app.dd.increment('cluster.master.died');
        process.exit(1);
      }
    } else {
      console.log('worker ' + worker.process.pid + ' was killed (' + signal + ')!');
      app.dd.increment('cluster.worker.killed');
    }
  });
} else {

  var setupPush = require('./pushSetup.js');
  var hookSetup = require('./hooks/hookSetup.js');
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
  var cred = require('./conf/credentials');

  var setupBrute = function () {
    var store = new MongoStore(function (ready) {
      var mongo = cred.get('mongo');
      // istanbul ignore if
      if(!mongo) {
        console.error(new Error('No database found!'));
        process.exit(1);
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

        var options = {};

        if(mongo.ssl) {
          var mongoCA = cred.get('mongoCA');
          if(mongoCA) {
            options.mongos = {
              ssl: true,
              sslValidate: true,
              sslCA: [mongoCA],
            };
          } else {
            console.error(new Error('No database found!'));
            process.exit(1);
          }
        }

        //console.log('Connecting to ' + mongodb);

        MongoClient.connect(mongodb, options, function(err, db) {
          // istanbul ignore if
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
  };

  var setupLogging = function () {
    app.debug = require('./logging.js').debug;
    // istanbul ignore if
    if( process.env.NODE_ENV === 'production') {
         var loggerFmt = 'method: :method,,' +
         'url: :url,,' +
         'status: :status,,' +
         'responseTime: :response-time ms,,'+
         'length: :res[content-length],,' +
         'remoteAddr: :remote-addr,,' +
         'referrer: :referrer,,' +
         'HTTP: :http-version,,' +
         'user-agent: :user-agent';

         app.use(loopback.logger(loggerFmt));
    } else {
      app.use(loopback.logger('dev'));
    }
  };

  // istanbul ignore next
  var setupConnectionLogging = function () {
    var logConnections = debounce(function () {
      if(app.dd && http) {
        app.dd.histogram('app.connections', http.connections);
      }
    }, 10);
    app.use(function log (req, res, next) {
      logConnections();
      next();
    });
  };

  var autoUpdateDB = function () { 
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
  };

  var setupMiddleware = function () {
    // Setup 
  //  setupMonitoring();
    setupBrute();
    setupLogging();

    //context for use in hooks
    app.use(loopback.context());
    app.use(loopback.token());

    setupConnectionLogging();

    //Security module
    app.use(helmet());

    // Compress everything
    app.use(loopback.compress());

    // Use datadog for monitoring
    if(datadog) {
      app.use(datadog);
    }
  };

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

  setupMiddleware();

  // istanbul ignore if
  if( process.env.NODE_ENV && process .env.NODE_ENV === 'production') {
    app.use(loopback.static(path.resolve(__dirname, '../common/')));
  } else {
    app.use(loopback.static(path.resolve(__dirname, '../client/www/')));
  }

  // Bootstrap the application, config ure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname);

  //Setup the push server
  setupPush(app);
  //Setup all the back end hooks
  hookSetup(app);
  // Call autoupdate on the databases
  autoUpdateDB();

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
  }

  //export the app for testing
  exports = module.exports = app;
}
