
var app = angular.module('instanews.position', ['ionic', 'ngResource','ngCordova']);

app.service('Position', [
      '$rootScope',
      'Platform',
      'LocalStorage',
      function(
         $rootScope,
         Platform,
         LocalStorage){

   //Boundary for articles and map
   var bounds;

   var setBounds = function(bnds) {
      bounds = bnds;
      notifyBoundsObservers();
   };

   var getBounds = function() {
      return bounds;
   };

   //Position stuff
   /*
   var mPosition = {
      lat: 45.61545,
      lng: -66.45270,
      radius: 500,
      accuracy: 0,
      radSlider: 0
   };
   */
   var mPosition = {};
   var modified = 0;

   /*
   // Watch the users position
   var posWatch = navigator.geolocation.watchPosition(
      updatePosition,
      function(err) {
         console.log('Error on position watch: ' + err);
      },
      {
         enableHighAccuracy: true
      });

   //Update our position
   function updatePosition(position) {
      set(position);
      console.log('Update position');
      /*
      mPosition.lat = position.coords.latitude;
      mPosition.lng = position.coords.longitude;
      mPosition.accuracy = position.coords.accuracy;
      */

      /*
      //updateMyCircle();
      //updateMarkers();
      var tempMarker = {
         map: map,
         visible: true,
         position: new google.maps.LatLng($scope.mPos.lat, $scope.mPos.lng),
         animation: google.maps.Animation.DROP
      };
      var marker = new google.maps.Marker(tempMarker);

      map.setCenter({lat: $scope.mPos.lat, lng: $scope.mPos.lng});
      map.setZoom(15);
      */
 //  }


   /*
   //Radius Slider
   var RadiusMax = Math.PI*6371000; //Half the earths circumference
   var RadiusMin = 500; //Minimum radius in meters
   var maxSlider = 500; //Slider range from 0 to 100
   var scale = maxSlider / Math.log(RadiusMax - RadiusMin + 1);

   mPosition.radSlider = radToSlide(mPosition.radius);

   $rootScope.$watch( function () {
      return mPosition.radSlider;
   }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
         var radius = slideToRad(newValue);

         if (radius <= mPosition.accuracy) {
            mPosition.radSlider = radToSlide(mPosition.accuracy);
            mPosition.limit = true;
         }
         else {
            mPosition.limit = false;
         }

         mPosition.radius = radius;
      }
   }, true);

   // Conversion functions
   Number.prototype.toRad = function() {
      return this * Math.PI / 180;
   };

   function radToSlide(radius) {
      return (Math.ceil(Math.log(radius - RadiusMin + 1)*scale)).toString();
   }

   function slideToRad(radSlider) {
      var radius =  Math.exp(parseInt(radSlider) / scale) + RadiusMin - 1;
      return radius;
   }
   */

   var withinRange = function (position) {

      //Method for a square
      if ( bounds) {
         return bounds.contains(position);
      }
      else {
         console.log('Bounds not loaded yet');
         return false;
      }

      //Method for a circle
      /*
      //haversine method
      var mLat = mPosition.lat.toRad();
      var lat = position.lat.toRad();
      var dLat = (mPosition.lat - position.lat).toRad();
      var dLng = (mPosition.lng - position.lng).toRad();

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(mLat) * Math.cos(lat) *
               Math.sin(dLng/2) * Math.sin(dLng/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      //Earths radius is 6371Km

      if ( mPosition.limit ) {
         return (6371000 * c <= mPosition.accuracy);
      }
      else {
         return (6371000 * c <= mPosition.radius);
      }
      */
   };

   Platform.ready
   .then( function() {
      //If we have not filled the position by the time the platform is ready then
      //attempt to load it from storage
      if( !mPosition || !mPosition.coords) {
         var UUID = Platform.getUUID();
         if(UUID) {
            LocalStorage.secureRead('position' + UUID, function(err, res) {
               if (err) {
                  console.log('Error reading position: ' + err);
               }
               else {
                  console.log('Read position from storage: ' + res.toString());
                  mPosition = res;
                  notifyObservers();
               }
            });
         }
      }
   });

   //Return the last position that was set
   var getLast = function() {
      return mPosition;
   };

   //Find and return the current position of the device
   var getCurrent = function(cb) {
      var time = new Date().getTime();
      //If we have updated the position in the last minute then just use it
      if(time - modified < 60000) {
         cb(null, getLast());
      }
      else {
         var options = {timeout: 10000, enableHighAccuracy: true};
         navigator.geolocation.getCurrentPosition(
            function(position) {
               cb(null,position);
            }, function(err) {
               console.log('Error getting position: ' + err.message);
               cb(err, null);
            }, options);
      }
   };

   //Set the position
   var set = function(position) {
      mPosition = position;
      modified = new Date().getTime();

      //Store the position
      var UUID = Platform.getUUID();
      if(UUID) {
         LocalStorage.secureWrite('position' + UUID, mPosition);
      }

      notifyObservers();
   };

   /* Observer */
   var observerCallbacks = [];

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

   var boundsObserverCallbacks = [];

   var registerBoundsObserver = function(cb) {
      boundsObserverCallbacks.push(cb);
   };

   var notifyBoundsObservers = function() {
      angular.forEach(boundsObserverCallbacks, function(cb) {
         cb();
      });
   };

   var posToLatLng = function(position) {
      if( position.coords) {
         //Position as returned from navigator.geolocation
         return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      }
      else if(position.lat && position.lng) {
         //Position as read from the database
         return new google.maps.LatLng(position.lat, position.lng);
      }
      //Position is already in Googles LatLng format
      else return position;
   };

   return {
      posToLatLng: posToLatLng,
      setBounds: setBounds,
      getBounds: getBounds,
      getCurrent: getCurrent,
      getLast: getLast,
      set: set,
      withinRange: withinRange,
      registerObserver: registerObserver,
      registerBoundsObserver: registerBoundsObserver,
      unregisterObserver: unregisterObserver
   };
}]);
