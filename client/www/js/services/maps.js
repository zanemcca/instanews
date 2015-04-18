
var app = angular.module('instanews.maps', ['ionic', 'ngResource','ngCordova']);

app.service('Maps', [
      'Position',
      function(
         Position){

   var feedMap, postMap, articleMap;

   var getArticleMap = function() {
      return articleMap;
   };

   var setArticleMap = function(map) {
      articleMap = map;
   };

   var getPostMap = function() {
      return postMap;
   };

   var setPostMap = function(map) {
      postMap = map;
   };

   var getFeedMap = function() {
      return feedMap;
   };

   var setFeedMap = function(map) {
      feedMap = map;
   };

   var localize = function(map, cb) {
      Position.getCurrent( function(err, position) {
         if(setCenter(map, position)) {
            map.setZoom(17);
            if(cb) {
               cb(null, position);
            }
            else {
               console.log('Successful localization!');
            }
         }
         else {
            if(cb) {
               cb('Failed localization!',null);
            }
            else {
               console.log('FAILED localization!');
            }
         }
      });
   };

   var setCenter = function(map, pos) {
      if(pos && pos.coords) {
         map.setCenter(Position.posToLatLng(pos));
         return true;
      }
      return false;
   };

   var setMarker = function(map, position) {
      var tempMarker = {
         map: map,
         animation: google.maps.Animation.DROP,
         position: Position.posToLatLng(position)
      };

      var marker = new google.maps.Marker(tempMarker);
      return marker;
   };

   var deleteMarker = function(marker) {
      if(marker) {
         marker.setVisible(false);
      }
      else {
         console.log('Marker is invalid! Cannot delete it.');
      }
      return;
   };

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

   return {
      localize: localize,
      setCenter: setCenter,
      setMarker: setMarker,
      deleteMarker: deleteMarker,
      setPostMap: setPostMap,
      getPostMap: getPostMap,
      setFeedMap: setFeedMap,
      getFeedMap: getFeedMap,
      getArticleMap: getArticleMap,
      setArticleMap: setArticleMap
   };
}]);
