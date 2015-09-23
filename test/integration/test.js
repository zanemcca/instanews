describe('Integration', function() {
  /*
  require('./depend.test.js');
  require('./hooks/test').run();
  require('./security/test').run();
 */
  require('./models/test').run();
  require('./permissions/test').run();
});
