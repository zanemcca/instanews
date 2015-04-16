var app = angular.module('instanews.map', ['ionic', 'ngResource', 'underscore']);

app.directive('inmap', [
      '_',
      'Position',
      'Articles',
      function (_, Position, Articles) {

   return {
      restrict: 'E',
      controller: function($scope,
         $stateParams,
         Position,
         Articles) {

//         var map = Position.getFeedMap();
//         var map = Position.getArticleMap();

         var map = {};
         //Reload the markers when we recieve new articles
         var updateMap = function() {
           updateHeatmap();
           console.log('Articles updated');
           //getMarkers();
         };

         Articles.registerObserver(updateMap);


//My Circle =============================================================

         /*
         var myCircle;
         var northPole = new google.maps.LatLng(90.0000, 0.0000);
         var southPole = new google.maps.LatLng(-90.0000, 0.0000);


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
            $scope.mPos.radSlider = Position.radToSlide(options.radius);
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
               if (!Position.withinRange({lat: marker.position.k, lng: marker.position.D})) {
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

               if (!Position.withinRange($scope.articles[i].location)) {
                  tempMarker.visible = false;
               }
               markers.push(new google.maps.Marker(tempMarker));
            }
         }

      */
// Heat Map ======================================================

         var heatmap;

         function createGradient() {

            var third = 8;
            var subValue = 256/third;

            //Transistion from baby blue to blue to red
            var gradient = ['rgba(0, 255, 255, 0)'];
            for(var i = 0; i < third; i++) {
               var temp =  'rgba(0,' + (255-subValue*i) + ',255, 1)'
               gradient.push(temp);
            }
            for(var i = 0; i < third; i++) {
               gradient.push( 'rgba(0,0,'+ (255 - subValue/2*i) +', 1)');
            }
            for(var i = 0; i < third; i++) {
               gradient.push( 'rgba('+ (subValue*i) +',0,'+ (128 - subValue/2*i) +', 1)');
            }
            gradient.push('rgba(255, 0, 0, 1)');

            return gradient;
         }

         function updateHeatmap() {
            var articleHeatArray = [];

            if( !Position.getBounds()) {
               return;
            }

            for(var i = 0; i < $scope.articles.length; i++) {
               var position = new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng);
               if (Position.withinRange(position)) {
                  articleHeatArray.push({
                     location: position,
                     weight: $scope.articles[i].rating
                  });
               }
            }

            if (!heatmap) {

               heatmap = new google.maps.visualization.HeatmapLayer({
                  map: map,
                  gradient: createGradient(),
                  data: articleHeatArray
               });
            }
            else {
               heatmap.setData(articleHeatArray);
            }
         }

         //Center the map on the current user position
         var localizeMap = function() {
            var mPos = Position.get();
            if(mPos && mPos.coords) {
               map.setCenter(posToLatLng(mPos));
               return true;
            }
            return false;
         };

         //Observer callback function that waits on the users position
         // and will center the map one time
         var localizeOnceObserver = function() {
            if(localizeMap()) {
               Position.unregisterObserver(localizeOnceObserver);
            }
         };

         var posToLatLng = function(position) {
            return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
         };

// MAP ======================================================

         //Initialize the map
          var initializeMap = function() {

            var position = Position.get();
            var mPosition = {};

            if(position && position.coords) {
               mPosition = posToLatLng(position);
            }
            else {
               console.log('No position for map!');
               mPosition = new google.maps.LatLng(45.5017 , -73.5673);
               Position.registerObserver(localizeOnceObserver);
            }

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
               google.maps.event.addListener(map, 'bounds_changed', _.debounce(function() {
                  console.log('Updating map');
                  Position.setBounds(map.getBounds());
                  updateHeatmap();
               }, 500));

               Position.setFeedMap(map);
            }

            //Article map only contains a marker to the current article
            //so all of its setup is done here
            var element = document.getElementById("articleMap");
            if ( element && element.textContent.indexOf('Map') === -1) {
               if ( $stateParams.id) {
                  $scope.article = Articles.getOne($stateParams.id);
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

               Position.setArticleMap(articleMap);
            }

          };


          initializeMap();
          /*
          //Wait for the device to be ready and then load the map
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
