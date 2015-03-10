var app = angular.module('instanews.map', ['ionic', 'ngResource']);

app.controller('MapCtrl', ['$scope', '$ionicLoading','$compile','Common', function($scope, $ionicLoading, $compile, Common) {

   $scope.articles = Common.articles;
   $scope.mPos = Common.mPosition;

   var map, myCircle;
   var markers = [];
   var northPole = new google.maps.LatLng(90.0000, 0.0000);
   var southPole = new google.maps.LatLng(-90.0000, 0.0000);

   $scope.$watch('articles', function (newValue, oldValue) {
      if (newValue !== oldValue) getMarkers();
   }, true);

   $scope.$watch('mPos.radius', function (newValue, oldValue) {
      if (newValue !== oldValue) {
         updateMyCircle();
         updateMarkers();
      }
   }, true);

   function updateMarkers() {
      angular.forEach( markers, function (marker) {
         if (!Common.withinRange({lat: marker.position.k, lng: marker.position.D})) {
            marker.setVisible(false);
         }
         else marker.setVisible(true);
      });
   }

   function getMarkers() {
      //TODO only update the changed ones not all
      angular.forEach( markers, function( marker) {
         marker.setMap(null);
      });
      markers.length = 0;

      var tempMarker = {
         map: map,
         animation: google.maps.Animation.DROP//,
         /*
         icon: {
            size: new google.maps.Size(120, 120),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 20),
            scaledSize: new google.maps.Size(30,30)
         }
         */
      };

      for(i = 0; i < $scope.articles.length; i++) {
         tempMarker.position = new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng);
         tempMarker.title = $scope.articles[i].title;
//         tempMarker.icon.url = 'img/ionic.png';

         if ( Common.withinRange($scope.articles[i].location)) {
            tempMarker.visible = false;
         }
         markers.push(new google.maps.Marker(tempMarker));
      }
   }

   function updateMyCircle() {
      if ($scope.mPos.radius < $scope.mPos.accuracy) {
         myCircle.setOptions({
            radius: $scope.mPos.accuracy,
            fillColor: 'red'
         });
      }
      else {
         myCircle.setOptions({
            radius: $scope.mPos.radius,
            fillColor: 'blue',
         });
      }
      //Update the map to contain the circle
      var bounds = myCircle.getBounds();
      map.fitBounds(bounds);
      //If the bounds contain either the north or south pole then
      // move to the equator for the center of the map
      if ( bounds.contains(northPole) || bounds.contains(southPole)) {
         var equator = new google.maps.LatLng(0.0000, $scope.mPos.lng);
         map.setCenter(equator);
      }
   }


   function drawMyCircle() {
      var options = {
         strokeColor: 'blue',
         strokeOpacity: 0.3,
         strokeWeight: 0,
         fillColor: 'blue',
         fillOpacity: 0.1,
         map: map,
         center: new google.maps.LatLng($scope.mPos.lat,$scope.mPos.lng)
      };
      if ($scope.mPos.radius < $scope.mPos.accuracy) options.radius = $scope.mPos.accuracy;
      else options.radius = $scope.mPos.radius;

      myCircle = new google.maps.Circle(options);
      map.fitBounds(myCircle.getBounds());
      console.log(options.radius);
      $scope.mPos.radSlider = Common.radToSlide(options.radius);
   }

   var error = function(err) {
      console.log(err);
   };

    var initializeMap = function() {

      var zoom = 8;

      var mPosition = new google.maps.LatLng($scope.mPos.lat,$scope.mPos.lng);

      var mapOptions = {
         center: mPosition,
         zoom: zoom,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      // Load the map
      map = new google.maps.Map(document.getElementById("map"), mapOptions);


      navigator.geolocation.getCurrentPosition( function(position) {
         $scope.mPos.lat = position.coords.latitude;
         $scope.mPos.lng = position.coords.longitude;
         /*
         $scope.mPos.lat = 43.7000;
         $scope.mPos.lng = -79.4000;
         */
         $scope.mPos.accuracy = position.coords.accuracy;
         mPosition = new google.maps.LatLng($scope.mPos.lat,$scope.mPos.lng);
         map.setCenter(mPosition);
         drawMyCircle();
         getMarkers();
      }, error, {enableHighAccuracy: true});
       /*
      //Cordova Google Map native plugin

      var div = document.getElementById("map_canvas");
      map = plugin.google.maps.Map.getMap(div);
      */

      //Google maps implementation

//      var myLatlng = new google.maps.LatLng(mLat,mLng);

       /*
      //Bing maps implementation
       var mapOptions = {
           credentials: "Ao1m9sBT9kMrHEzRKteLvqHeNBvSGA8LNXusHmwiL9Rz7Eck1bKU7OQ3WHh8fESs",
           mapTypeId: Microsoft.Maps.MapTypeId.road,
           center: new Microsoft.Maps.Location(mLat,mLng),
           zoom: 11
       };
       var map = new Microsoft.Maps.Map(document.getElementById("map"), mapOptions);
       */

    };

    ionic.DomUtil.ready( function() {
       if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/)) {
          document.addEventListener("deviceready", initializeMap, false);
       } else {
          initializeMap();
       }
       console.log(navigator.userAgent);
    });

    /*
    ionic.DomUtil.ready( function() {
       console.log("Running Dom Util")
       document.addEventListener("deviceready", function() {
         var div = document.getElementById("map_canvas");
         map = plugin.google.maps.Map.getMap(div);
          console.log("Running event listener")
       }, false);
    });
    */
}]);

