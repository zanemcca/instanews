var setupPush = require('./pushSetup.js');
var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var https = require('https');
var pem = require('pem');
var helmet = require('helmet');
var app = loopback();

var ExpressBrute = require('express-brute');
var MongoStore = require('express-brute-mongo');
var MongoClient = require('mongodb').MongoClient;

var cred = require('./conf/credentials');

console.log('Starting in ' + process.env.NODE_ENV + ' environment');

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

//Security module
app.use(helmet());

// Compress everything
app.use(loopback.compress());

app.use(loopback.static(path.resolve(__dirname, '../client/www/')));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

//Setup the push server
setupPush(app);
//Setup all the back end hooks
require('./hooks/hookSetup.js')(app);

app.start = function() {

  // start the http web server
  app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });

  /*
   //Create certificates
   //TODO Use a Certificate Authority such as Comodo.com
   pem.createCertificate({
      days:1,
      selfSigned: true
   }, function(err, keys) {
      if(err) {
         console.log('Error generating SSL keys: ' + err);
         return;
      }
      //Create our https server
      var server = https.createServer({
         key: keys.serviceKey,
          cert: keys.certificate
      }, app);

      server.listen(3443, function() {
         var baseUrl = 'https://' + app.get('host') + ':3443';
         app.emit('started', baseUrl);
         console.log('Loopback server listening @ %s%s', baseUrl, '/');
      });
      return server;
   });
  */
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}

//export the app for testing
if( process.env.NODE_ENV !== 'production') {
  exports = module.exports = app;
}
