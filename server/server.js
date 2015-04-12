var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var app = module.exports = loopback();

app.use(loopback.static(path.resolve(__dirname, '../client/www/')));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

//Setup the push server
require('./pushSetup.js')(app);

//Setup all server side hooks that we need
require('./hooks/votes.js')(app);
require('./hooks/vote.js')(app);
require('./hooks/installation.js')(app);
require('./hooks/notification.js')(app);
require('./hooks/push.js')(app);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}

//export the app for testing
exports = module.exports = app;
