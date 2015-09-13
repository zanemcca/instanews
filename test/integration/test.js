describe('Integration', function() {
  require('./hooks/test').run();
  require('./models/test').run();
  require('./security/test').run();
  require('./permissions/test').run();
});
