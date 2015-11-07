
describe.skip('App: ', function(){

  /*
  beforeEach(module(function  ($stateProvider) {
  }));

  var mockStateRouter, mockUrlRouter;
  beforeEach(function () {
    module('ui.router', function (
      $stateProvider,
      $urlRouterProvider
    ) {
  //    mockStateRouter = $stateRouter;
      mockUrlRouter = $urlRouterProvider;
  //    sinon.spy(mockStateRouter, 'state');
      sinon.spy(mockUrlRouter, 'otherwise');
    });
  });
  */
  //Load the module and create mocks for all dependencies
  beforeEach( function() {

    module('ui.router');
    module('instanews');

    module(function($provide) {
      $provide.service('User', function() {
        return {
          registerObserver: function (cb) {
            cb();
          },
          logout: function () {},
          login: function () {},
          get: function () {},
        };
      });
    });
  });

  // Inject the controller and initialize any dependencies we need
  beforeEach(inject(function(
    $controller, 
    $rootScope,
    User
  ){
    scope = $rootScope.$new(); 
    user = User;

    controller = $controller('AppCtrl', {
      $scope: scope,
      User: user
    });

    scope.$digest();
  }));

  describe('app', function() {
    var usr;
    beforeEach(function () {
      usr = 'user';
      sinon.stub(user, 'registerObserver', function (cb) {
        cb();
      });

      sinon.stub(user, 'get', function () {
        return usr;
      });

      conroller();
    });

    describe('updateUser', function () {
      it('should call User.regiserObserver', function (done) {
        done();
      });
    });
  });
});
