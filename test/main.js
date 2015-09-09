
if( process.env.NODE_ENV !== 'production') {
  switch(process.env.TEST_TYPE) {
    case 'unit':
      require('./unit/test').run();
      break;
    case 'integration':
      require('./integration/test').run();
      break;
    default: 
      require('./unit/test').run();
      require('./integration/test').run();
  }
}
else {
  console.error('Error: Tests cannot be run in production mode!');
}
