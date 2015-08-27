
if( process.env.NODE_ENV !== 'production') {
  require('./hooks/test').run();
  require('./models/test').run();
  require('./security/test').run();
  //require('./permissions/test').run();
}
else {
  console.error('Error: Tests cannot be run in production mode!');
}
