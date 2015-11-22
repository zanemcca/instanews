"use strict";

describe('instanews.service.navigate', function() {

  var navigate, ionicSideMenuDelegate, ionicScrollDelegate, ionicHistory;

  beforeEach(function() {

    module('instanews.service.navigate');
  });

  beforeEach(inject(function(
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $ionicHistory,
    Navigate
  ) {
    navigate = Navigate;
    ionicSideMenuDelegate = $ionicSideMenuDelegate;
    ionicScrollDelegate = $ionicScrollDelegate;
    ionicHistory = $ionicHistory;
  }));

  var spec;
  beforeEach(function () {
    spec = {};
    navigate = navigate(spec);
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
      navigate.scrollTop();
      expect(ionicScrollDelegate.scrollTop.calledOnce).to.be.true;
    });
  });
});
