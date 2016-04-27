
'use strict';
var app = angular.module('instanews.service.position', ['ionic', 'ngResource','ngCordova']);

app.service('Position', [
  'Platform',
  'LocalStorage',
  '$q',
  function(
    Platform,
    LocalStorage,
    $q
  ){

    var ready = $q.defer();
    var boundsReady = $q.defer();

    //Boundary for articles and map
    var bounds;
    var mPosition;
    var observerCallbacks = [];
    var boundsObserverCallbacks = [];

    var setBounds = function(bnds) {
      bounds = bnds;
      boundsReady.resolve();
      notifyBoundsObservers();
    };

    var getBounds = function() {
      return bounds;
    };

    var  withinBounds = function (position) {
      //Method for a square
      if ( bounds) {
        return bounds.contains(position);
      }
      else {
        console.log('Warning: No Bounds set yet');
        return true;
      }
    };

    /* Observer */
    var registerObserver = function(cb) {
      observerCallbacks.push(cb);
    };

    var unregisterObserver = function(cb) {
      var index = observerCallbacks.indexOf(cb);
      if(index > -1) {
        observerCallbacks.splice(index,1);
      }
    };

    var notifyObservers = function() {
      angular.forEach(observerCallbacks, function(cb) {
        cb();
      });
    };

    var registerBoundsObserver = function(cb) {
      boundsObserverCallbacks.push(cb);
    };

    var notifyBoundsObservers = function() {
      angular.forEach(boundsObserverCallbacks, function(cb) {
        cb();
      });
    };

    var getPosition = function() {
      return mPosition;
    }; 

    //Set the position
    var set = function(position) {
      //console.log('Setting position');
      //console.log(position);
      if(position && position.coords && position.coords.latitude && position.coords.longitude) {
        mPosition = position;

        //Store the position
        var pos = {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        };

        if(Platform.isIOS() && !Platform.isBrowser()) {
          LocalStorage.secureWrite('position', pos);
        }

        ready.resolve();
        notifyObservers();
      } else {
        console.log('Invalid position given');
        console.dir(position);
      }
    };

    // Converts the given position to a google maps LatLng object
    var posToLatLng = function(position) {
      if( position.coords) {
        //Position as returned from navigator.geolocation
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      } else if( position.coordinates) {
        //Position as in geoJSON format 
        return new google.maps.LatLng(position.coordinates[1], position.coordinates[0]);
      }
      // istanbul ignore else
      else if(position.lat && position.lng) {
        var latLng =  new google.maps.LatLng(position.lat, position.lng);
        if(!latLng.lat()) {
          //Position is already in Googles LatLng format
          return new google.maps.LatLng(position.lat(), position.lng());
        }
        else {
          //Position as read from the database
          return latLng;
        }
      }
    };

    //Prefer HTML5 geolocation if available
    var geolocation = navigator.geolocation;
    var watchId;

    var firstSetup = true;
    var setupGeolocation =  function () { 
      if(firstSetup) {
        firstSetup = false;
        // If we do not have the users position within one second then look for it in 
        // memory or use central Montreal
        Platform.ready
        .then( function() {
          // istanbul ignore if
          if( !geolocation ) {
            console.log('HTML5 geolocation not availble. Using cordova plugin instead.');
            geolocation = navigator.geolocation;
          }

          //If we have not filled the position by the time the platform is ready then
          //attempt to load it from storage
          // Watch the users position
          watchId = geolocation.watchPosition(
            set,
            function(err) {
              console.log('Error on position watch');
              console.log(err);
            },
            {
              //maximumAge: 5000,
              timeout: 30000,
              enableHighAccuracy: true   //GPS & Network based location
            });

            if(Platform.isIOS() && !Platform.isBrowser()) {
              //If the users location is not found in one second then try and read the last known position
              setTimeout(function () {
                // istanbul ignore else
                if( !mPosition || !mPosition.coords) {
                  LocalStorage.secureRead('position', function(err, res) {
                    // istanbul ignore else
                    if (err || !(res && res.coords)) {
                      console.log('Failed to find an old location');
                    } else {
                      // istanbul ignore else
                      if(!mPosition) {
                        console.log('Using stored position');
                        set(res);
                      }
                    }
                  });
                }
               },1000);
            }
        });
      }
    };

    var getPermission = function (cb, rejected) {
      rejected = rejected || function () {
        console.log('Geolocation permission has been rejected');
      };

      Platform.ready
      .then( function() {
        //if(Platform.isIOS() || Platform.isBrowser()) {
        if(Platform.isIOS()) {
          LocalStorage.secureRead('geolocationPermission', function(err, res) {
            if(err || !res || !res.hasPermission) {
              if(err) {
                console.log('Failed to read geolocationPermission');
                console.log(err);
              }

              Platform.showConfirm(
                'To see news in your area, allow instanews to use your location.',
                'instanews never shares your location!',
                ['Allow', 'Later'],
                function (buttonIdx) {
                  if(buttonIdx === 1) {
                    var permission = {
                      hasPermission: true
                    };

                    LocalStorage.secureWrite('geolocationPermission', permission);
                    setupGeolocation();
                    cb();
                  } else {
                    rejected();
                  }
                });
            } else {
              setupGeolocation();
              cb();
            }
          });
        } else if (Platform.isAndroid6()) {
          Platform.permissions.location.requestAuthorization(function (authorized) {
            if(authorized) {
              setupGeolocation();
              cb();
            } else {
              rejected();
            }
          }, function(err) {
            console.log('Failed to request geolocationPermission');
            console.log(err);
            rejected();
          });
        } else {
          setupGeolocation();
          cb();
        }
      });
    };

    return {
      ready: ready.promise,
      boundsReady: boundsReady.promise,
      posToLatLng: posToLatLng,
      getPermission: getPermission,
      setBounds: setBounds,
      getBounds: getBounds,
      getPosition: getPosition,
      set: set,
      withinBounds: withinBounds,
      registerObserver: registerObserver,
      registerBoundsObserver: registerBoundsObserver,
      unregisterObserver: unregisterObserver
    };
  }]);
