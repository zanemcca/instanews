var app = angular.module('instanews.map', ['ionic', 'ngResource']);

app.directive('inmap', [
      'Common',
      function (Common) {

   return {
      restrict: 'E',
      controller: function($scope,
         $stateParams,
         $ionicLoading,
         $compile,
         Common) {

         $scope.mPos = Common.mPosition;

         var map, articleMap;
         var posWatch;

         var northPole = new google.maps.LatLng(90.0000, 0.0000);
         var southPole = new google.maps.LatLng(-90.0000, 0.0000);

         //Update our position
         function updatePosition(position) {
            $scope.mPos.lat = position.coords.latitude;
            $scope.mPos.lng = position.coords.longitude;
            $scope.mPos.accuracy = position.coords.accuracy;

            //updateMyCircle();
            //updateMarkers();
            updateHeatmap();
         }

         //Reload the markers when we recieve new articles
         $scope.$watch('articles', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              updateHeatmap();
              //getMarkers();
            }
         }, true);


//My Circle =============================================================

         /*
         var myCircle;

         //Watch our accuracy so that we always know if we hit our limit
         $scope.$watch('mPos.accuracy', function(newValue, oldValue) {
            if (newValue !== oldValue) {
               if (newValue >= $scope.mPos.radius) {
                  $scope.mPos.limit = true;
                  $scope.mPos.radius =  newValue;
               }
               else {
                  $scope.mPos.limit = false;
               }
            }
         });

         //Update our circle and markers when the radius changes
         $scope.$watch('mPos.radius', function (newValue, oldValue) {
            if (newValue !== oldValue) {
               updateMyCircle();
               updateMarkers();
            }
         }, true);

         //Update my circle
         function updateMyCircle() {
            if( !myCircle) {
               drawMyCircle();
            }

            myCircle.setRadius($scope.mPos.radius);
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

         //Draw my circle initially
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
            options.radius = $scope.mPos.radius;

            myCircle = new google.maps.Circle(options);
            map.fitBounds(myCircle.getBounds());
            console.log(options.radius);
            $scope.mPos.radSlider = Common.radToSlide(options.radius);
         }
         */


//MARKERS =============================================================

         /*
         var markers = [];
         var articleMarker;

         //Update the markers on the map
         function updateMarkers() {
            if( markers.length === 0) {
               getMarkers();
            }
            angular.forEach( markers, function (marker) {
               if (!Common.withinRange({lat: marker.position.k, lng: marker.position.D})) {
                  marker.setVisible(false);
               }
               else marker.setVisible(true);
            });
         }

         //Get the markers initially
         function getMarkers() {
            //TODO only update the changed ones not all
            for( var i = 0 ; i < markers.length ; i++) {
               markers[i].setMap(null);
            }
            markers = [];

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
 /*           };

            for( var i = 0; i < $scope.articles.length; i++) {
               tempMarker.position = new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng);
               tempMarker.title = $scope.articles[i].title;
       //        tempMarker.icon.url = 'img/ionic.png';

               if (!Common.withinRange($scope.articles[i].location)) {
                  tempMarker.visible = false;
               }
               markers.push(new google.maps.Marker(tempMarker));
            }
         }

      */
// Heat Map ======================================================

         var heatmap;

         function updateHeatmap() {
            var articleHeatArray = [];
            for(var i = 0; i < $scope.articles.length; i++) {
               var position = new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng);
               if (Common.withinRange(position)) {
                  articleHeatArray.push({
                     location: position,
                     weight: Math.pow(2,$scope.articles[i].rating)
                  });
               }
            }

            if (!heatmap) {
               heatmap = new google.maps.visualization.HeatmapLayer({
                  map: map,
                  data: articleHeatArray
               });
            }
            else {
               heatmap.setData(articleHeatArray);
            }
         }

// MAP ======================================================

         //Error callback
         var error = function(err) {
            console.log(err);
         };

         //Initialize the map
          var initializeMap = function() {
            var mPosition = new google.maps.LatLng($scope.mPos.lat,$scope.mPos.lng);

            var mapOptions = {
               center: mPosition,
               zoom: 8,
               mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            // Load the maps and check to make sure there is not already a map
            // loaded in the element before initializing
            var element = document.getElementById("feedMap");
            if ( element && element.textContent.indexOf('Map') === -1) {
               map = new google.maps.Map(element, mapOptions);
               posWatch = navigator.geolocation.watchPosition( updatePosition, error, {enableHighAccuracy: true});

               google.maps.event.addListener(map, 'bounds_changed', function() {
                  Common.setBounds(map.getBounds());
                  updateHeatmap();
               });
            }

            //Article map only contains a marker to the current article
            //so all of its setup is done here
            var element = document.getElementById("articleMap");
            if ( element && element.textContent.indexOf('Map') === -1) {
               if ( $stateParams.id) {
                  $scope.article = Common.getArticle($stateParams.id);
                  mapOptions.center = new google.maps.LatLng($scope.article.location.lat, $scope.article.location.lng);
                  mapOptions.zoom = 15;
               }
               articleMap = new google.maps.Map(element, mapOptions);
               var tempMarker = {
                  map: articleMap,
                  animation: google.maps.Animation.DROP,
                  position: mapOptions.center
               };
               articleMarker = new google.maps.Marker(tempMarker);
            }

            //Refresh the map everytime we enter the view
            $scope.$on('$ionicView.enter', function() {
               google.maps.event.trigger(map, 'resize');
               google.maps.event.trigger(articleMap, 'resize');
            });
          };


          initializeMap();
          /*
          //Wait for the device to be ready and then load the map
          //TODO Re initialize the map
          ionic.DomUtil.ready( function() {
             if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/)) { //Mobile map load
                document.addEventListener("deviceready", initializeMap, false);
             } else { //Web version
                initializeMap();
             }
          });
          */
      }/*,
      templateUrl: 'templates/directives/map.html'
      */
   };
}]);
