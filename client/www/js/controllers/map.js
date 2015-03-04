var app = angular.module('instanews.map', ['ionic', 'ngResource']);

app.controller('MapCtrl', ['$scope', '$ionicLoading','$compile','Common', function($scope, $ionicLoading, $compile, Common) {

   $scope.articles = Common.articles;

   var map;

   $scope.$watch('articles', function (newValue, oldValue) {
      if (newValue !== oldValue) getMarkers();
   }, true);

   function getMarkers() {
      var tempMarker = {
         map: map,
         animation: google.maps.Animation.DROP,
         icon: {
            size: new google.maps.Size(120, 120),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 20),
            scaledSize: new google.maps.Size(30,30)
         }
      }

      for(i = 0; i < $scope.articles.length; i++) {
         tempMarker.position = new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng);
         tempMarker.title = $scope.articles[i].title;
         tempMarker.icon.url = 'img/ionic.png';

         var marker = new google.maps.Marker(tempMarker);
      }
   }

    var initializeMap = function() {
       var mLat = 45.61545;
       var mLng = -65.45270;

       console.log("Fired up 1!");
       /*
      //Cordova Google Map native plugin

      var div = document.getElementById("map_canvas");
      map = plugin.google.maps.Map.getMap(div);
      */

      //Google maps implementation

      var myLatlng = new google.maps.LatLng(mLat,mLng);

      var mapOptions = {
         center: myLatlng,
         zoom: 11,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

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

      getMarkers();
    }

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

