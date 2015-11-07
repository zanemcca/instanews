
describe('Login: ', function(){

  var deferred;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {

    module('instanews.controller.login');

    module(function($provide) {
      $provide.service('Navigate', function() {
        return {
          disableNextBack: function() {}
        };
      });

      $provide.service('Platform', function() {
        return {
          getDevice: function() {}
        };
      });

      $provide.service('User', function() {
        var set = function(cred) {
        };

        return {
          set: set
        };
      });

      $provide.service('LocalStorage', function() {
        return {
          secureWrite: function(uuid, session) {}
        };
      });

      $provide.service('$ionicModal', function($q) {
        return {
          fromTemplateUrl: function(uri, obj) {
            deferred = $q.defer()
            return deferred.promise;
          }
        };
      });

      $provide.service('$cordovaDevice', function() {
        return {
          getUUID: function() {
            return '2903478-234927304987'
          }
        };
      });

      $provide.service('Journalist', function($q) {
        var create = function( journ , cb) {
          console.log('Journalist created');
          cb(null, journ);
        };

        var count = function( where, succ, fail) {
          succ({
            count: 0
          });
        };

        var login = function( obj, credentialsi, success, failed) {};
        return {
          create: create,
          count: count,
          login: login
        };
      });
    });

  });

  // Inject the controller and initialize any dependencies we need
  beforeEach(inject(function(
    $q,
    $controller, 
    $rootScope,
    $state,
    $ionicModal, 
    $cordovaDevice,
    Navigate,
    Platform,
    User,
    LocalStorage,
    Journalist
  ){
    scope = $rootScope.$new(); 
    state = $state;
    user = User;
    navigate = Navigate;
    journalist = Journalist;
    storage = LocalStorage;
    platform = Platform;

    controller = $controller('LoginCtrl', {
      $scope: scope,
      $state: $state,
      $ionicModal: $ionicModal, 
      $cordovaDevice: $cordovaDevice,
      Navigate: Navigate,
      Platform: Platform,
      User: User,
      LocalStorage: LocalStorage,
      Journalist: Journalist
    });

    scope.$digest();
  }));

  // Initialize some local variables
  beforeEach( function() {
    scope.newUser = {
      username: 'ttest',
      email: 'timmy@instanews.com',
      password: 'password',
      remember: true
    };

    scope.cred = {
      username: 'timmy',
      email: 'timmy@instanews.com',
      password: 'password',
      remember: true
    };
  });

  describe('signup' , function() {

    beforeEach( function() {
      sinon.stub(scope, 'login', function() {
        console.log('Login stub');
      });

      sinon.stub(scope, 'trashNewUser', function() {
        console.log('TrashNewUser stub');
      });

      scope.$digest();
    });

    it('should signup a new user', function() {

      scope.signup();
      expect(scope.cred.username).to.equal('ttest'); 
      expect(scope.cred.password).to.equal('password');
      expect(scope.cred.remember).to.be.true;

      expect(scope.login.calledOnce).to.be.true;
      expect(scope.trashNewUser.calledOnce).to.be.true;
    });

    it('should reject the signup because the username or email is taken', function() {

      sinon.stub(journalist, 'count', function(obj, succ, fail) {
        succ({
          count: 1 
        });
      });

      scope.signup();

      expect(journalist.count.calledOnce).to.be.true;

      expect(scope.credUsed).to.be.true;

      scope.newUser.username = ''
      scope.$digest();

      expect(scope.credUsed).to.be.false;
    });

  });

  describe('login', function() {
    it('should login with username', function() {
      scope.cred.email = ''; 

      var login = sinon.stub(
        journalist,
        'login',
        function(obj,
          cred,
          successLogin,
          failedLogin
      ) {
        expect(scope.cred.username).to.not.equal('');
        expect(scope.cred.password).to.not.equal('');
      });

      scope.login();

      expect(login.calledOnce).to.be.true;
    });

    it('should login with email', function() {
      scope.cred.username = ''; 

      var login = sinon.stub(
        journalist,
        'login',
        function(obj,
          cred,
          successLogin,
          failedLogin
      ) {
        expect(scope.cred.email).to.not.equal('');
        expect(scope.cred.password).to.not.equal('');
      });

      scope.login();

      expect(login.calledOnce).to.be.true;
    });

    it('should call success callback', function() {

        var set = sinon.stub(user, 'set');
        var disable = sinon.stub(navigate, 'disableNextBack');
        var go = sinon.stub(state, 'go');
        /*
        var write = sinon.stub(storage, 'secureWrite');
        var getDev = sinon.stub(platform, 'getDevice', function() {
            var device = {
              type: 'iOS',
              token: '' 
            };
            return device;
        });
       */

        var login = sinon.stub(journalist, 'login', function(obj, cred, success, fail) {
          success(scope.cred);
        });

        scope.login();

        expect(set.calledOnce).to.be.true;
        expect(disable.calledOnce).to.be.true;
        expect(go.calledOnce).to.be.true;
        /*
        expect(getDev.calledOnce).to.be.true;
        expect(write.calledOnce).to.be.true;
       */

        expect(scope.cred.username).to.equal('');
        expect(scope.cred.email).to.equal('');
        expect(scope.cred.password).to.equal('');
        expect(scope.cred.remember).to.be.true;

        expect(scope.invalidLogin).to.be.false;

      });

    it('should call failed callback', function() {

        var login = sinon.stub(journalist, 'login', function(obj, cred, success, fail) {
          fail('Stubbed error');
        });

        scope.login();

        expect(scope.cred.password).to.equal('');

        expect(scope.invalidLogin).to.be.true;
      });

  });

  it('should clear the newUser', function() {

    scope.signupModal = {
      hide: function() {
        console.log('Modal hide stub');
      }
    };

    var hide = sinon.stub(scope.signupModal, 'hide');

    scope.trashNewUser();

    expect(scope.newUser.remember).to.be.true;
    expect(scope.newUser.username).to.be.equal('');
    expect(scope.newUser.email).to.be.equal('');
    expect(scope.newUser.password).to.be.equal('');

    expect(hide.calledOnce).to.be.true;
  });
  
  it('should be a valid email', function() {
    scope.newUser.email = 'bob@instanews.com';

    expect(scope.validEmail()).to.be.true;
  });

  it('should be an invalid email', function() {
    scope.newUser.email = 'bob@instanewscom';
    expect(scope.validEmail()).to.be.false;

    scope.newUser.email = 'bobinstanews.com';
    expect(scope.validEmail()).to.be.false;
  });

  describe('password strength', function() {
    // < 8 char
    it('should be an invalid password', function() {
      scope.newUser.password = 'abc123';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(-1);
    });

    // >= 8 char
    it('should be a moderate password', function() {
      scope.newUser.password = 'iamapass';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(1);
    });

    // >= 8 char && (numbers || uppercase || special char)
    // >= 12 char 
    it('should be a strong password', function() {
      scope.newUser.password = '1amapass';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(2);

      scope.newUser.password = '!amapass';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(2);

      scope.newUser.password = 'Iamapass';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(2);

      scope.newUser.password = 'carsgofaster';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(2);
    });

    // >= 8 char && 2 of numbers || uppercase || special char
    // >= 12 char && (numbers || uppercase || special char)
    it('should be a very strong password', function() {

      scope.newUser.password = '1amaPass';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(3);

      scope.newUser.password = '!amaPass';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(3);

      scope.newUser.password = '1amap@ss';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(3);

      scope.newUser.password = 'carsgof@ster';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(3);

      scope.newUser.password = 'carsgofa5ter';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(3);

      scope.newUser.password = 'carsgoFaster';
      scope.$digest();
      expect(scope.passwordStrength).to.equal(3);
    });

  });

});
