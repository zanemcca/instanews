describe('Integration', function() {
  require('./hooks/test').run();
  require('./security/test').run();
  require('./models/test').run();
  //TODO Rewrite permissions using new dependency injection
  //require('./permissions/test').run();
});
