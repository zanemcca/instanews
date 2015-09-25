
describe('Integration', function() {
  before(function (done) {
    this.timeout(10000);
    // Delay before integration tests are run to ensure the server is properly loaded
    setTimeout(done, 5000);
  });

  require('./hooks/test').run();
  require('./security/test').run();
  require('./models/test').run();
  //TODO Rewrite permissions using new dependency injection
  //require('./permissions/test').run();
});
