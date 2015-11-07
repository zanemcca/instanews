
'use strict';
var app = angular.module('instanews.directive.map', [
  'ionic',
  'ngResource'
]);

app.directive('inmap', [
  '$stateParams',
  'Position',
  'Maps',
  'Platform',
  'Articles',
  function (
    $stateParams,
    Position,
    Maps,
    Platform,
    Articles
  ) {

    return {
      restrict: 'E',
      scope: {
        map: '='
      },
      link: function(
        scope,
        elem
      ) {

        var element = elem[0].querySelector('#map');

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
          if ( element && element.textContent.indexOf('Map') === -1) {
            var map;
            switch(scope.map.id) {
              case 'feedMap':
                map = new google.maps.Map(element, mapOptions);

                if(navigator.splashscreen) {
                  navigator.splashscreen.hide();
                }
                //Listener on bounds changing on the map
                google.maps.event.addListener(map, 'bounds_changed', _.debounce(function() {
                  console.log('Updating bounds');
                  Position.setBounds(map.getBounds());
                }, 100));

                //TODO Use this to create teh localization button on the map
                //map.controls[google.maps.ControlPosition.TOP_CENTER].push(TEMPLATE);

                Maps.setFeedMap(map);
                break;
              case 'postMap':
                mapOptions.zoom = 18;
                mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
                //var marker;

                map = new google.maps.Map(element, mapOptions);
                Maps.setPostMap(map);

                google.maps.event.addListener(map, 'click', function(event) {
                  Maps.setMarker(Maps.getPostMap(), event.latLng);
                });

                Maps.setMarker(map, mPosition);
                break;
              case 'articleMap':
                if ( $stateParams.id) {
                  scope.article = Articles.getOne($stateParams.id);
                  mapOptions.center = new google.maps.LatLng(scope.article.location.lat, scope.article.location.lng);
                  mapOptions.zoom = 18;
                  mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
                }
                else {
                  console.log('Not id given! The article map is dependent on knowing the article location!');
                }
                map = new google.maps.Map(element, mapOptions);

                Maps.setArticleMap(map);

                break;
              default:
                console.log('Unknown map Id: ' + map.id);
            }
          } else {
            console.log('Map directive is broken!');
          }
        };

        Position.ready.then(function () {
          initializeMap();
        });
      },
      templateUrl: 'templates/directives/map.html'
    };
  }]);
