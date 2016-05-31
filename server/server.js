
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
  if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
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

    /*
     *TODO Get this working
    app.dd.socket.on('error', function (e) {
      console.warn('Socket error with Datadog');
      console.error(e);
      return;
    });
   */

    app.DD = function(modelName, functionName) {
      if(!modelName || !functionName) {
        console.warn('modelName and functionName are required to monitor stats!');
        return;
      }

      //The calling function becomes a tag on the reported function
      var tags = ['model:' + modelName, 'function:' + modelName + '.' + functionName];

      var start = Date.now();
      var time = start;

      var name = function (given) {
        given = given || modelName + '_' + functionName;
        return 'app.' + given.replace('.','_');
      };

      var dd = {};
      dd.increment = function(key, val, tgs) {
        val = val || 1;
        tgs = tgs || [];
        tgs = tgs.join(tags);
        app.dd.increment(name(key), val, tgs);
      };

      dd.decrement = function(key, val, tgs) {
        val = val || 1;
        tgs = tgs || [];
        tgs = tgs.join(tags);
        app.dd.decrement(name(key), val, tags);
      };

      dd.timing = function(key, val, tgs) {
        tgs = tgs || [];
        tgs = tgs.join(tags);
        app.dd.timing(name(key), val, tags);
      };

      dd.histogram = function(key, val, tgs) {
        tgs = tgs || [];
        tgs = tgs.join(tags);
        app.dd.histogram(name(key), val, tags);
      };

      dd.lap = function (key, tgs) {
        var temp = Date.now();
        var lap = temp - time;
        time = temp;
        dd.timing(key, lap, tgs);
        return lap;
      };

      dd.elapsed =  function (key, tgs) {
        var total = Date.now() - start;
        dd.timing(key, total, tgs);
        return total;
      };

      return dd;
    };

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
      lap: function () {},
      elapsed: function () {},
      histogram: function () {},
      timing: function () {},
      increment: function () {},
      decrement: function () {}
    };

    app.DD = function () {
      return app.dd;
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
  var Redis = require('ioredis');
  var kue = require('kue');
  var sm = require('sitemap');
  var requestIp = require('request-ip');
  var geoip = require('geoip-lite');

  var setupModerator = function () {
    if(['staging', 'production'].indexOf(process.env.NODE_ENV) > -1) {
      var WebPurify = require('webpurify');
      var creds = cred.get('webpurify');
      var wp = new WebPurify({
        api_key: creds.apiKey 
      });
      app.moderator = wp;
    } else {
      app.moderator = {
        check: function() {
          return {
            then: function(cb) {
              cb();
            }
          };
        }
      };
    }
  };

  var setupRedis = function () {
    var options = {
      reconnectOnError: function (err) {
        console.warn('Redis error!');
        console.dir(err); 
        var targetError = 'READONLY';
        if (err.message.slice(0, targetError.length) === targetError) {
          console.log('Reconnecting Redis!');
          // Only reconnect when the error starts with "READONLY"
          return true; // or `return 1;`
        } else {
          console.error('Redis error is fatal!');
          process.exit(-1);
        }
      }
    };

    var redis = cred.get('redis');
    options.port = redis.port;
    options.host = redis.host;
    options.password = redis.password;

    app.redisClient = new Redis(options);

    app.jobs = kue.createQueue({
      redis: {
        createClientFactory: function () {
          return new Redis(options);
        }
      }
    });

    //TODO Secure this so we can expose it for debugging production
    kue.app.listen(5001);

    //Recover stuck jobs every 10 sec
    app.jobs.watchStuckJobs(10000);

    //Process the updateBase queue
    app.jobs.process('deferredUpdate', function (job, ctx, done) {
      var dd = app.DD('Jobs', 'processDeferredUpdate');
      app.models.Base.processUpdate(job.data.key, function (err) {
        if(err) {
          console.error('Failed to process the job!');
          console.dir(err);
          return done(err);
        }

        dd.lap('Base.processUpdate');
        done();
      });

      ctx.pause(500, function(err) {
        // Max 1 job/sec/node
        setTimeout(function() {
          ctx.resume();
        }, 1000);
      });
    });

    //Catch queue errors
    app.jobs.on('error', function(err) {
      console.error('Jobs queue error!');
      console.dir(err);
      app.jobs.shutdown( 5000, function(err) {
        if(err) {
          console.error('Failed to shutdown the jobs queue!');
          console.dir(err);
          process.exit(-1);
        } else {
          console.log('Shutdown the jobs queue!');
          process.exit(-1);
        }
      });
    });

    //Gracefully shutdown the queue
    process.once('SIGTERM', function (sig) {
      app.jobs.shutdown( 5000, function (err) {
        if(err) {
          console.error('Failed to shutdown the jobs queue!');
          console.dir(err);
          process.exit(-1);
        } else {
          console.log('Shutdown the jobs queue!');
          process.exit(0);
        }
      });
    });
  };

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
    app.debug = require('./helpers/logging.js').debug;
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

  var setupEmail = function () {
    app.email = require('./helpers/email.js').email;
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

    if(process.env.AUTOUPDATE_DB) {
      for(var name in app.dataSources) {
        dataSource = app.dataSources[name];
        dataSource.on('connected', onConnected.bind(onConnected, dataSource)); 
      }
    }
  };

  var setupMiddleware = function () {
    // Setup 
  //  setupMonitoring();
    setupRedis();
    setupBrute();
    setupLogging();
    setupModerator();
    setupEmail();

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

  var getSitemap = function(cb) {
    var urls = [
      { url: '/', changefreq: 'always', priority: 0.9 },
      { url: '/TermsOfService.html', changefreq: 'monthly', priority: 0.1 },
      { url: '/DMCAPolicy.html', changefreq: 'monthly', priority: 0.1 },
      { url: '/PrivacyPolicy.html', changefreq: 'monthly', priority: 0.1 }
    ];

    var featuredGeographies = [
      'Montreal__QC__Canada',
      'Toronto__ON__Canada',
      'Ottawa__ON__Canada',
      'Vancouver__BC__Canada',
      'Calgary__AB__Canada',
      'Edmonton__AB__Canada',
      'Winnipeg__MB__Canada',
      'Halifax__NS__Canada',
      'Hamilton__ON__Canada',
      'St._John\'s__NL__Canada',
      'Fredericton__NB__Canada',
      'Moncton__NB__Canada',
      'Saint_John__NB__Canada',
      'Kitchener-Waterloo__Waterloo_Regional_Municipality__ON__Canada',
      'Regina__SK__Canada',
      'Saskatoon__SK__Canada',
      'Kingston__ON__Canada',
      'Niagara_Falls__ON__Canada',
      'Victoria__BC__Canada',
      'Guelph__ON_Canada',
      'Charlottetown__PE__Canada',
      'London__ON__Canada',
      'Windsor__ON__Canada',
      'Kelowna__BC__Canada',
      'Nanaimo__BC__Canada',
      'Kamloops__BC__Canada',
      'Lethbridge__AB__Canada',
      'Thunder_Bay__ON__Canada',
      'Sudbury__ON__Canada',
      'Red_Deer__AB__Canada',
      'Belleville__ON__Canada',
      'Chatham-Kent__ON__Canada'
    ];

    for(var i in featuredGeographies) {
      urls.push({ url: '/news/feed?search=' + featuredGeographies[i], changefreq: 'always', priority: 0.9 });
    }

    var getArticleParam = function(art) {
      var removeBrackets = function(input) {
        return input
              .replace(/{+.*?}+/g, '')
              .replace(/\[+.*?\]+/g, '')
              .replace(/\(+.*?\)+/g, '')
              .replace(/<.*?>/g, '');
      };

      var preprocess = removeBrackets(art.title);
      var split = preprocess.split(' ');
      var words = [];
      for(var i in split) {
        var wrd = split[i];
        if(!wrd.match(/[^\w\s]/gi)) { //Words must not contain special characters
          if(wrd.match(/^[A-Z0-9]/g)) { //Words must start with a capital letter
            words.push(wrd);
          }
        }
      }
      words.push(art.id);
      return words.join('-');
    };

    app.models.Article.find({ sort: 'rating DESC' }, function(err, res) {
      if(err) {
        console.error(err.stack);
        var e = new Error('Internal error with sitemap generation!');
        e.status = 503;
        return cb(e);
      }

      for(i in res) {
        art = res[i];
        var url = '/news/article/' + getArticleParam(art);
        urls.push({ url: url, changefreq: 'hourly', priority: art.rating, lastmod: art.modified });
      }

      sitemap = sm.createSitemap({
        hostname: 'https://instanews.com',
        cacheTime: 10*60*1000, //10 min cachetime
        urls: urls
      });

      cb(null, sitemap);
    });
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

  // Redirect all instanews.com requests to www.instanews.com
  app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^instanews.com/) !== null ) {
      var newUrl = 'https://www.' + req.headers.host + req.url;
      res.redirect(301, newUrl);
    } else {
      next();
    }
  });

  setupMiddleware();

  app.use(requestIp.mw());
  app.set('views', path.resolve(__dirname, '../client/www/'));
  app.set('view engine', 'ejs');

  var renderIndex = function(req, res, next) {
    var ip = req.clientIp;
    //ip = '205.179.247.220'; //Southern States
    //ip = '107.179.247.220'; //Mtl
    var geo = geoip.lookup(ip);
    var arg = {};
    if(geo) {
      arg = {
        cache: false,
        ip: ip,
        country: geo.country || null,
        city: geo.city || null,
        region: geo.region || null,
        ll: geo.ll || null
      };
    } else {
      console.warn('Invalid Ip address: ' + ip);
      arg = {
        cache: false,
        ip: null,
        country: null,
        city: null,
        region: null,
        ll: null
      };
    }

    res.render('index', arg, function(err, html) {
      if(err) {
        console.error(err.stack);
        next(err);
      } else {
        res.send(html);
      }
    });
  };

  app.get('/', renderIndex);

  // istanbul ignore if
  app.use(loopback.static(path.resolve(__dirname, '../client/www/')));

  // Create a healthcheck API
  app.use('/healthcheck', require('express-healthcheck')());

  // Expose the Terms of Service and Privacy Policy
  app.use(loopback.static(path.resolve(__dirname + '/public')));

  if(process.env.NODE_ENV === 'production') {
    // Sitemap.xml generation ondemand
    app.get('/sitemap.xml', function(req, res, next) {
      getSitemap(function(err, sitemap) {
        if(err) {
          return next(err);
        }
        res.header('Content-Type', 'application/xml');
        res.send(sitemap.toString());
      });
    });
  }

  app.get('/robots.txt', function(req, res, next) {
    var rbts = 'User-agent: *\n';
    if(process.env.NODE_ENV === 'staging') {
      rbts += 'Disallow: /';
    } else if (process.env.NODE_ENV === 'production') {
      //rbts += 'Disallow: /api/\n';
      rbts += 'Disallow: /healthcheck';
    }
    res.type('text/plain');
    res.send(rbts);
  });

  // Bootstrap the application, config ure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname);

  // This enables html5Mode by forwarding any unfound file to the angular frontend
  app.all('/*', renderIndex) ;

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


  //Setup error handler last
  var errorHandler = require('./middleware/errorHandler.js')();
  app.get('remoting').errorHandler = {
    handler: errorHandler,
    disableStackTrace: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')
  };

  //export the app for testing
  exports = module.exports = app;
}
