"use strict";

describe('instanews.service.navigate', function() {

  var navigate,
  user,
  ionicSideMenuDelegate,
  ionicScrollDelegate,
  ionicHistory;

  beforeEach(function() {

    module('instanews.service.navigate');

    module(function($provide) {
      $provide.service('User', function() {
        return {
          get: function () {}
        };
      });

      $provide.service('Platform', function() {
        return {
          loading: {
            hide: function () {}
          }
        };
      });
    });
  });

  beforeEach(inject(function(
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $ionicHistory,
    Navigate,
    Platform,
    User
  ) {
    navigate = Navigate;
    user = User;
    platform = Platform;
    ionicSideMenuDelegate = $ionicSideMenuDelegate;
    ionicScrollDelegate = $ionicScrollDelegate;
    ionicHistory = $ionicHistory;
  }));

  var spec;
  beforeEach(function () {
    spec = {};
    scroll = navigate.scroll(spec);
  });

  describe('toggleMenu', function() {
    it('should call $ionicSideMenuDelegate.toggleLeft', function() {
      sinon.spy(ionicSideMenuDelegate, 'toggleLeft');
      navigate.toggleMenu();
      expect(ionicSideMenuDelegate.toggleLeft.calledOnce).to.be.true;
    });
  });

  describe('disableNextBack', function() {
    it('should call $ionicHistory.nextViewOptions', function() {
      sinon.stub(ionicHistory, 'nextViewOptions', function(arg) {
        expect(arg.disableBack).to.be.true;
      });
      navigate.disableNextBack();
      expect(ionicHistory.nextViewOptions.calledOnce).to.be.true;
    });
  });

  describe('scrollTop', function() {
    it('should call $ionicScrollDelegate.scrollTop', function() {
      sinon.spy(ionicScrollDelegate, 'scrollTop');
      scroll.scrollTop();
      expect(ionicScrollDelegate.scrollTop.calledOnce).to.be.true;
    });
  });
});
