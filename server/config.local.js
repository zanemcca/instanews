
var exports = {};
if(process.env.NODE_ENV === 'development') {
   console.log(process.env.NODE_ENV);
}
else if( process.env.NODE_ENV === 'staging') {
   console.log(process.env.NODE_ENV);
}
else {
   console.log('Should be in production mode: ' + process.env.NODE_ENV);
   exports = {
      remoting: {
         errorHandler: {
            disableStackTrace: true
         }
      }
   };
}

module.exports = exports;
