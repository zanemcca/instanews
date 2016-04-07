
module.exports = function(options) {

  var email = require('../helpers/email.js').email;

    /* istanbul ignore if */
  return function errorHandler(err, req, res, next) {

    res.statusCode = err.status || err.statusCode || res.statusCode;

    if(!res.statusCode) {
      res.statusCode = 500;
    }

    var e = {
      status: res.statusCode,
      error: err.code || 'server_error'
    };

    if(res.statusCode < 400) {
      res.send(err);
    } else if(res.statusCode === 404) {
      e.message = 'This is not the page you are looking for ...';
      res.send(e);
    } else if( res.statusCode === 401) {
      e.message = 'Thou shalt not pass!!!';
      res.send(e);
    } else if( [403, 422, 400, 429].indexOf(res.statusCode) > -1) {
      e.error = err.error;
      e.message = err.message;
      res.send(e);
    } else {
      console.error('Unrecoverable - error status code ' + res.statusCode);
      console.error(err.stack);

      if(process.env.NODE_ENV === 'production' ||
         process.env.NODE_ENV === 'staging') {
        //Send a notification to the backend manager
        email.send({
          from: 'error@instanews.com',
          to: 'alertbackend@instanews.com',
          subject: err.message,
          text: err.stack
        }, function(err, info) {
          if (err) {
            console.log('Failed to send email!');
            console.error(err);
          } else {
            console.log('Error report has been mailed to' +
                        'alertbackend@instanews.com\n');
          }
          process.exit(1);
        });
        res.send(e);
      } else {
        e.stack = err.stack;
        res.send(e);
        process.exit(1);
      }
    }

  };
};
