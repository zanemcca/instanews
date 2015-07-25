
'use strict';
var app = angular.module('instanews.map', ['ionic', 'ngResource', 'underscore']);

app.directive('inmap', [
      '_',
      'Maps',
      'Platform',
      function (_) {

   return {
      restrict: 'E',
      controller: function($scope,
         $stateParams,
         Position,
         Maps,
         Platform,
         Articles) {

         var map = {};

         //Observer callback function that waits on the users position
         // and will center the map one time
         var localizeOnceObserver = function() {
            var mPos = Position.getLast();
            if(Maps.setCenter(map, mPos)) {
               Position.unregisterObserver(localizeOnceObserver);
            }
         };

         //Initialize the map
          var initializeMap = function() {

            var position = Position.getLast();
            var mPosition = {};

            if(position && position.coords) {
               mPosition = Position.posToLatLng(position);
            }
            else {
               //Load Montreal for now
               mPosition = new google.maps.LatLng(45.5017 , -73.5673);
            }

            var mapOptions = {
               center: mPosition,
               zoom: 12,
               disableDefaultUI: true,
               mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            // Load the maps and check to make sure there is not already a map
            // loaded in the element before initializing
            var element = document.getElementById('feedMap');
            if ( element && element.textContent.indexOf('Map') === -1) {
               map = new google.maps.Map(element, mapOptions);

               //Listener on bounds changing on the map
               google.maps.event.addListener(map, 'bounds_changed', _.debounce(function() {
                  console.log('Updating bounds');
                  Position.setBounds(map.getBounds());
               }, 100));

               Maps.setFeedMap(map);

               Position.getCurrent( function(err, position) {
                  //If we get a valid position then center the map
                  if(position && position.coords) {
                     //Save the new position
                     Position.set(position);
                     Maps.setCenter(map, position);
                  }
                  else { //If we do not get a good position then wait for the position and localize
                     console.log('No position for map!: '+ err.message);
                     Position.registerObserver(localizeOnceObserver);
                  }
               });
            }

            //Article map only contains a marker to the current article
            //so all of its setup is done here
            var elem = document.getElementById('articleMap');
            if ( elem && elem.textContent.indexOf('Map') === -1) {
               if ( $stateParams.id) {
                  $scope.article = Articles.getOne($stateParams.id);
                  mapOptions.center = new google.maps.LatLng($scope.article.location.lat, $scope.article.location.lng);
                  mapOptions.zoom = 15;
               }
               else {
                  console.log('Not id given! The article map is dependent on knowing the article location!');
               }
               var articleMap = new google.maps.Map(elem, mapOptions);

               Maps.setArticleMap(articleMap);

            }

            var element = document.getElementById('postMap');
            if ( element && element.textContent.indexOf('Map') === -1) {

              mapOptions.zoom = 18;
              //var marker;

              map = new google.maps.Map(element, mapOptions);
              Maps.setPostMap(map);

              google.maps.event.addListener(map, 'click', function(event) {
                Maps.setMarker(Maps.getPostMap(), event.latLng);
              });

               Position.getCurrent( function(err, position) {
                  //If we get a valid position then center the map
                  if(position && position.coords) {
                     //Save the new position
                     Position.set(position);
                     Maps.setCenter(map, position);
                     Maps.setMarker(map, position);
                  }
                  else { //If we do not get a good position then wait for the position and localize
                     console.log('No position for map!: '+ err.message);
                     Position.registerObserver(localizeOnceObserver);
                  }
               });
            }
          };

      Platform.ready.then(initializeMap());
      }
   };
}]);
