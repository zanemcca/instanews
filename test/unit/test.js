describe('Unit', function() {
  require('./conf/test').run();
  require('./hooks/test').run();
  require('./models/test').run();
  require('./middleware/test').run();
});
