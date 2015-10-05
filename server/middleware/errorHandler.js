
/*
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'error@instanews.com',
    pass: 'couchesareabit2fly4me'
  }
});
*/

module.exports = function(options) {
  return function errorHandler(err, req, res, next) {
    /* istanbul ignore if */
    if(process.env.NODE_ENV === 'production' ||
       process.env.NODE_ENV === 'staging') {

      if(err.status) { 
        res.statusCode = err.status;
      }

      if(!res.statusCode || res.statusCode < 400) {
        res.statusCode = 500;
      }

      var e = {
        error: err.code || 'server_error'
      };

      if(res.statusCode === 404) {
        e.message = 'This is not the page you are looking for ...';
      }
      else if( err.status === 401 || err.status === 403 ) {
        e.message = 'Thou shalt not pass!!!';
      }
        /*
      else {
        console.error('Unrecoverable - error status code!');
        console.error(err.stack);

        if(process.env.NODE_ENV === 'production') {
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
       */

      res.send(e);
    }
    else {
      next(err);
    }
  };
};
