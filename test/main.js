
if( process.env.NODE_ENV !== 'production') {
  require('./security/test').run();
  require('./hooks/test').run();
  require('./permissions/test').run();
}
else {
  console.error('Error: Tests cannot be run in production mode!');
}
