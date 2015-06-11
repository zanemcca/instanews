
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'error@instanews.com',
    pass: 'couchesareabit2fly4me'
  }
});

module.exports = function(options) {
  return function errHandler(err, req, res, next) {
    if(process.env.NODE_ENV === 'production') {
      if(err.status === 404) {
        res.status(404);
        res.send('This is not the page you\'re looking for ...');
        next();
      }
      else if( err.status === 401) {
        res.status(401);
        res.send('Thou shalt not pass!!!');
        next();
      }
      else {
        console.log(err.message);
        console.error(err.stack);

        //Send a notification to the backend manager
        transport.sendMail({
          from: 'error@instanews.com',
          to: 'alertbackend@instanews.com',
          subject: err.message,
          text: err.stack
        }, function(erri, info) {
          if (err) console.error(err);
          console.log('Error report has been mailed to' +
            'alertbackend@instanews.com\n');
          process.exit(1);
        });
      }
    }
    else {
      next(err);
    }
  };
};
