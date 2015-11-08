      
"use strict";

describe('instanews.service.user', function() {

  var localStorage, platform, installation, user, journalist, loopbackAuth;

  var usr;
  beforeEach(function() {
    usr = {
      userId: 'sven'
    };

    module('instanews.service.user');

    module(function($provide) {
      $provide.service('LocalStorage', function() {
        return {
          secureDelete: function(key) {}
        };
      });

      $provide.service('Platform', function() {
        return {
          getDevice: function() {
            return {
              type: 'ios',
              token: 'adfasdf54df654asd65f14sad65f3s5'
            };
          },
          isBrowser: function() {
            return false;
          },
          getUUID: function() {
            return 'uuid';
          }
        };
      });

      $provide.service('Journalist', function() {
        return {
          logout: function() {
            return {
              $promise: {
                then: function (cb) {
                  cb();
                }
              }
            };
          },
          prototype$__create__accessTokens: function(args, dunno, succ, err) {
            succ(usr);
          }
        };
      });

      $provide.service('LoopBackAuth', function() {
        return {
          accessTokenId: 'accessToken',
          currentUserId: 'username'
        };
      });

      $provide.service('Installation', function() {
        return {
          create: function(conf, succ, err) {
            succ();
          }
        };
      });
    });

  });

  beforeEach(inject(function(
    Installation,
    LocalStorage,
    Platform,
    Journalist,
    LoopBackAuth,
    User
  ) {
    installation = Installation;
    localStorage = LocalStorage;
    journalist = Journalist;
    loopbackAuth = LoopBackAuth;
    platform = Platform;
    user = User;
  }));

  describe('get' , function() {
    it('should return undefined', function() {
      expect(user.get()).to.deep.equal(usr);
    });

    it('should return the user', function() {
      var usr = 'hey';
      user.set(usr);
      var res = user.get();
      expect(res).to.be.exist;
      expect(res).to.equal(usr);
    });
  });

  describe('getToken' , function() {
    it('should return undefined', function() {
      expect(user.getToken()).to.be.undefined;
    });

    it('should return the user id', function() {
      var usr = {
        id: 'hey'
      };
      user.set(usr);
      var res = user.getToken();
      expect(res).to.be.exist;
      expect(res).to.equal(usr.id);
    });
  });

  describe('set', function() {

    it('should save the user', function() {
      var usr = 'hey';
      user.set(usr);
      var res = user.get();
      expect(res).to.be.exist;
      expect(res).to.equal(usr);
    });

    it('should notify observers', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      user.registerObserver(fake.func);

      user.set();

      expect(fake.func.calledOnce).to.be.true;
    });

    it('should call Platform.install', function() {
      sinon.spy(platform, 'getDevice');
      user.set();
      expect(platform.getDevice.calledOnce).to.be.true;
    });
  });

  describe('registerObserver', function() {
    it('should be notified', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      user.registerObserver(fake.func);

      user.set();

      expect(fake.func.calledOnce).to.be.true;
    });
  });

  describe('clearData', function() {
    it('should delete the in memory user', function() {
      var usr = 'hey';
      user.set(usr);
      user.clearData();
      expect(user.get()).to.be.undefined;
    });
  });

  describe('install', function() {
    beforeEach(function() {
      var usr = {
        username: 'bob'
      };
      user.set(usr);
    });

    it('should call Platform.getDevice', function() {
      sinon.spy(platform, 'getDevice');
      user.install();
      expect(platform.getDevice.calledOnce).to.be.true;
    });

    it('should call Installation.create', function() {
      sinon.stub(installation,'create', function(conf, succ, fail) {
        var dev = platform.getDevice();
        expect(conf).to.deep.equal({
          appId: 'instanews',
          userId: user.get().username,
          deviceType: dev.type,
          deviceToken: dev.token,
          status: 'Active'
        });
        succ();
      });

      user.install();
      expect(installation.create.calledOnce).to.be.true;
    });
  });
});
