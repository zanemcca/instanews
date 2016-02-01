
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
  '_',
  function (
    $stateParams,
    Position,
    Maps,
    Platform,
    Articles,
    _
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
        var map;

        //Initialize the map
        var initializeMap = function() {
          var instanewsMapType = new google.maps.StyledMapType([
            {
              stylers: [
                {hue: '#023E4F'},
                {visibility: 'simplified'},
                {gama: 0.5},
                {weight: 0.5}
              ]
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{visibility: 'off'}]
            },
            {
              featureType: 'water',
              stylers: [{color: '#023E4F'}]
            }
          ], {
            name: 'Instanews Style'
          });
          var instanewsMapTypeId = 'instanews_style';

          //Defaults to a view of Canada
          var mapOptions = {
            mapTypeId: google.maps.MapTypeId.HYBRID,
            center: Position.posToLatLng({ coords: { latitude: 54.708031, longitude: -95.871324}}),
            zoom: 3,
            minZoom: 3,
            disableDefaultUI: true, 
          };

          // Load the maps and check to make sure there is not already a map
          // loaded in the element before initializing
          // istanbul ignore else
          if ( element && element.textContent.indexOf('Map') === -1) {
            switch(scope.map.id) {
              case 'feedMap': {
                // istanbul ignore else
                if(navigator.splashscreen) {
                  navigator.splashscreen.hide();
                }

                mapOptions.maxZoom = 17;
                map = new google.maps.Map(element, mapOptions);
                map.mapTypes.set(instanewsMapTypeId, instanewsMapType);
                map.setMapTypeId(instanewsMapTypeId);

                //Listener on bounds changing on the map
                google.maps.event.addListener(map, 'bounds_changed', _.debounce(function() {
                  console.log('Updating bounds');
                  Position.setBounds(map.getBounds());
                }, 100));

                //TODO Use this to create teh localization button on the map
                //map.controls[google.maps.ControlPosition.TOP_CENTER].push(TEMPLATE);

                Maps.setFeedMap(map);
                Maps.localize(map);

                break;
              }
              case 'postMap': {
                //mapOptions.zoom = 18;
                mapOptions.maxZoom = 18;
                //mapOptions.minZoom = 9;

                var feedMap = Maps.getFeedMap();
                if(feedMap) {
                  mapOptions.center = feedMap.getCenter();
                  mapOptions.zoom = Math.max(feedMap.getZoom(), mapOptions.minZoom);
                } else {
                  console.log('No Feed map present!');
                }

                mapOptions.styles = [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{visibility: 'off'}]
                  }
                ];

                map = new google.maps.Map(element, mapOptions);

                map.mapTypes.set(instanewsMapTypeId, instanewsMapType);
                map.setMapTypeId(instanewsMapTypeId);

                google.maps.event.addDomListener(map, 'zoom_changed', function () {
                  var zoom = map.getZoom();
                  if(zoom < 16) {
                    map.setMapTypeId(instanewsMapTypeId);
                  } else {
                    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                  }
                });

                google.maps.event.addListener(map, 'click', function(event) {
                  Maps.setMarker(Maps.getPostMap(), event.latLng);
                });

                //map.setTilt(45);
                Maps.setPostMap(map);
                Maps.setMarker(map, mapOptions.center);
                break;
              }
              case 'articleMap': {
                // istanbul ignore else
                if ( $stateParams.id) {
                  scope.article = {};
                  Articles.findById($stateParams.id, function(article) {
                    scope.article = article;
                    if(article) {
                      mapOptions.center = new google.maps.LatLng(scope.article.location.lat, scope.article.location.lng);
                      mapOptions.zoom = 18;
                      //mapOptions.minZoom = 9;
                      mapOptions.tilt = 45;
                      if(map) {
                        map.setOptions(mapOptions);
                        map.setCenter(mapOptions.center);
                        map.setZoom(mapOptions.zoom);
                        map.setTilt(mapOptions.tilt);
                      }
                    } else {
                      console.log('Failed to find article!');
                      //TODO Replace the map with something
                    }
                  });
                }
                else {
                  console.log('No id given! The article map is dependent on knowing the article location!');
                  //TODO Replace the map with something
                }

                mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
                mapOptions.styles = [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                stylers: [{visibility: 'off'}]
                  }
                ];

                map = new google.maps.Map(element, mapOptions);
                /*
                map.mapTypes.set(instanewsMapTypeId, instanewsMapType);
                map.setTilt(45);

                google.maps.event.addDomListener(map, 'zoom_changed', function () {
                  var zoom = map.getZoom();
                  if(zoom < 16) {
                    map.setMapTypeId(instanewsMapTypeId);
                  } else {
                    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                  }
                });
               */

                google.maps.event.addDomListener(map, 'center_changed', _.debounce(function() {
                  if(!map.getBounds().contains(mapOptions.center)) {
                    console.log('setting center');
                    map.panTo(mapOptions.center);
                  }
                }, 50));

                Maps.setArticleMap(map);

                break;
              }
              default: {
                // istanbul ignore next
                console.log('Unknown map Id: ' + map.id);
              }
            }
          } else {
            console.log('Map directive is broken!');
          }
        };

        initializeMap();
      },
      templateUrl: 'templates/directives/map.html'
    };
  }]);
