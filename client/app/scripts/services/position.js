
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
          return false;
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
        if(position && position.coords && position.coords.latitude && position.coords.longitude) {
          mPosition = position;

          //Store the position
          var UUID = Platform.getUUID();
          if(UUID) {
            var pos = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            };

            LocalStorage.secureWrite('position' + UUID, pos);
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
        }
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

      // Watch the users position
      navigator.geolocation.watchPosition(
        set,
        function(err) {
          console.log('Error on position watch: ' + err);
        },
        {
          enableHighAccuracy: false   //Network based location 
          //enableHighAccuracy: true   //GPS & Network based location
        }
      );

      // If we do not have the users position within one second then look for it in 
      // memory or use central Montreal
      Platform.ready
      .then( function() {
        //If we have not filled the position by the time the platform is ready then
        //attempt to load it from storage
        if( !mPosition || !mPosition.coords) {
          var UUID = Platform.getUUID();
          if(UUID) {
            LocalStorage.secureRead('position' + UUID, function(err, res) {
              if (err || !(res && res.coords)) {
                //If an old location is not found and the users location cannot be determined
                //then default to Montreal
                res = { coords: { latitude: 45.5017 , longitude: -73.5673}};
              }

              if(!mPosition) {
                set(res);
              }
            });
          }
        }
      });

      return {
        ready: ready.promise,
        boundsReady: boundsReady.promise,
        posToLatLng: posToLatLng,
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
