
"use strict";

describe('Position service', function() {

  var value,
  isIOS = false,
  location,
  watchPos,
  err;

  before( function () {
    sinon.stub(navigator.geolocation, 'watchPosition', function (succ, fail, opt) {
      watchPos = function () {
        succ(location);
      };
    });
  }); 

  beforeEach(function () {
    location = {
      coords: {
        latitude: 45,
        longitude: -67
      }
    };
  });

  beforeEach(function() {
    module('instanews.service.position');
    module('mock.services.platform');
    module('mock.services.localStorage');
  });

  var 
  position,
  platform,
  localStorage;

  beforeEach(inject(function(
    LocalStorage,
    Platform,
    Position
  ) {
    localStorage = LocalStorage;
    platform = Platform;
    position = Position;

    sinon.stub(platform, 'isIOS').returns(isIOS);
  }));

  describe('successful watch', function () {
    beforeEach(function (done) {
      position.getPermission(function () {
        watchPos();
        done();
      });
    })

    it('should use the location given by navigator.geolocation.watchPostion', function () {
      expect(position.getPosition()).to.equal(location);
    });

    describe('set', function () {
      var loc = {
        coords: {
          latitude: 7,
          longitude: -1 
        }
      };

      it('should set the given position', function () {
        position.set(loc);
        expect(position.getPosition()).to.deep.equal(loc);
      });

      //Not neccesary
      it.skip('should write the position to localstorage', function (done) {
        sinon.stub(localStorage, 'secureWrite', function (name, pos) {
          expect(name).to.equal('position');
          expect(pos).to.deep.equal(loc);
          done();
        });

        position.set(loc);
        expect(localStorage.secureWrite.calledOnce).to.be.true;
        localStorage.secureWrite.restore();
      });

      it('should not set an invalid position', function () {
        position.set({});
        expect(position.getPosition()).to.equal(location);
      });
    });

    describe('getPosition' , function() {
      it('should return the users location', function() {
        expect(position.getPosition()).to.equal(location);
      });
    });

    describe('bounds', function () {

      it('should set and return the bounds', function () {
        var bounds = 'bounds';
        position.setBounds(bounds);
        expect(position.getBounds()).to.equal(bounds);
      });

      it('should call bounds.contains on the given position', function () {
        var loc = 'location';
        var bounds = {
          contains: function(pos) {
            expect(pos).to.equal(loc);
            return true;
          }
        };

        position.setBounds(bounds);
        expect(position.withinBounds(loc)).to.be.true;
      });

      it('should return true if the bounds are not set yet', function () {
        expect(position.withinBounds()).to.be.true;
      });
    });

    describe('registerObserver', function() {
      it('should be notified', function() {
        var fake = {
          func: function() {}
        };
        sinon.spy(fake, 'func');
        position.registerObserver(fake.func);

        position.set({
          coords: {
            latitude: 55,
            longitude: 7
          }
        }); 

        expect(fake.func.calledOnce).to.be.true;
      });
    });

    describe('unregisterObserver', function() {
      it('should not be notified', function() {
        var fake = {
          func: function() {}
        };
        sinon.spy(fake, 'func');
        position.registerObserver(fake.func);
        position.unregisterObserver(fake.func);

        position.set({ coords: 'valid location' }); 
        expect(fake.func.callCount).to.equal(0);
      });
    });

    describe('registerBoundsObserver', function() {
      it('should be notified', function() {
        var fake = {
          func: function() {}
        };
        sinon.spy(fake, 'func');
        position.registerBoundsObserver(fake.func);

        position.setBounds('valid bounds'); 
        expect(fake.func.calledOnce).to.be.true;
      });
    });

    describe.skip('unregisterBoundsObserver', function() {
      it('should not be notified', function() {
        var fake = {
          func: function() {}
        };
        sinon.spy(fake, 'func');
        position.registerBoundsObserver(fake.func);
        position.unregisterBoundsObserver(fake.func);

        position.setBounds('valid bounds'); 
        expect(fake.func.callCount).to.equal(0);
      });
    });

    describe('posToLatLng', function () {
      var latLng;
      before(function () {
        sinon.stub(google.maps, 'LatLng', function (lat, lng) {
          var res = latLng(lat, lng);
          this.lat = res.lat
          return this;
        });
      });

      it('should convert navigator.geolocation format to google format', function (done) {
        var loc = {
          coords: {
            latitude: 45,
            longitude: -76
          }
        };

        latLng = function (lat, lng) {
          expect(lat).to.equal(loc.coords.latitude);
          expect(lng).to.equal(loc.coords.longitude);
          done();
        };

        position.posToLatLng(loc);
      });

      it('should convert the stored format to google format', function () {
        var loc = {
          lat: 45,
          lng: -76
        };

        latLng = function (lat, lng) {
          expect(lat).to.equal(loc.lat);
          expect(lng).to.equal(loc.lng);

          return {
            lat: function () {
              return 55;
            }
          };
        };

        expect(position.posToLatLng(loc).lat()).to.equal(55);
      });

    });
  });

  // Not neccessary
  // Only iOS
  describe.skip('unsuccessful or slow watch', function () {
    describe('Read last known position from memory', function () {
      var clock;

      before(function () {
        clock = sinon.useFakeTimers();
      });

      after(function () {
        clock.restore();
      });

      it('should read the position from memory', function (done) {
        sinon.stub(localStorage, 'secureRead', function(key, cb) {
          cb(err, value);
        });

        value = location;

        position.getPermission(function () {
          clock.tick(1000);

          var pos = position.getPosition();
          console.log(pos);
          expect(pos).to.deep.equal(location);
          done();
        });
      });
    });
  });
});
