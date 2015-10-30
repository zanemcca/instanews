
'use strict';
var app = angular.module('instanews.directive.map', [
  'ionic',
  'ngResource',
  'underscore'
]);

app.directive('inmap', [
  '_',
  'Maps',
  'Platform',
  function (_) {

    return {
      restrict: 'E',
      controller: function(
        $scope,
        $stateParams,
        Position,
        Maps,
        Platform,
        Articles) {

          var map = {};

          //Initialize the map
          var initializeMap = function() {

            var position = Position.getPosition();
            var mPosition = {};

            if(position && position.coords) {
              mPosition = Position.posToLatLng(position);
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

              //TODO Use this to create teh localization button on the map
              //map.controls[google.maps.ControlPosition.TOP_CENTER].push(TEMPLATE);

              Maps.setFeedMap(map);
            }

            //Article map only contains a marker to the current article
            //so all of its setup is done here
            var elem = document.getElementById('articleMap');
            if ( elem && elem.textContent.indexOf('Map') === -1) {
              if ( $stateParams.id) {
                $scope.article = Articles.getOne($stateParams.id);
                mapOptions.center = new google.maps.LatLng($scope.article.location.lat, $scope.article.location.lng);
                mapOptions.zoom = 18;
                mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
              }
              else {
                console.log('Not id given! The article map is dependent on knowing the article location!');
              }
              var articleMap = new google.maps.Map(elem, mapOptions);

              Maps.setArticleMap(articleMap);

            }

            var postElem = document.getElementById('postMap');
            if ( postElem && postElem.textContent.indexOf('Map') === -1) {

              mapOptions.zoom = 18;
              mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
              //var marker;

              map = new google.maps.Map(postElem, mapOptions);
              Maps.setPostMap(map);

              google.maps.event.addListener(map, 'click', function(event) {
                Maps.setMarker(Maps.getPostMap(), event.latLng);
              });

              Maps.setMarker(map, mPosition);
            }
          };

          Position.ready.then(function () {
            initializeMap();
          });
        }
    };
  }]);
