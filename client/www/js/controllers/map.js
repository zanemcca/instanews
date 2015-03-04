var app = angular.module('instanews.map', ['ionic', 'ngResource']);

app.controller('MapCtrl', ['$scope', '$ionicLoading','$compile','Common', function($scope, $ionicLoading, $compile, Common) {

   $scope.articles = Common.getArticles();

   var map;

   function getMarkers() {
      for(i = 0; i < $scope.articles.length; i++) {
         var marker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng),
            map: map,
            title: $scope.articles[i].title,
            animation: google.maps.Animation.DROP
         });
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
       console.log("Fire it up!");
       document.addEventListener("deviceready", initializeMap, false);

       google.maps.event.addDomListener(window, 'load', initializeMap);

       console.log("=====================");
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

