
'use strict';
var app = angular.module('instanews.directive.map', [
  'ionic',
  'ngResource'
]);

app.directive('inmap', [
  '$stateParams',
  '$ionicGesture',
  'Dialog',
  'Position',
  'Maps',
  'Platform',
  'Articles',
  '_',
  function (
    $stateParams,
    $ionicGesture,
    Dialog,
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
        elem,
        attrs
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
          var coords = {
            latitude: 54.708031,
            longitude: -95.871324
          };

          var zoom =  3;

          if(window.geo) { //Override location with the users appx location
            //TODO Use the city or country and look up the place
            if(window.geo.ll && window.geo.ll.length === 2) {
              coords.latitude = window.geo.ll[0];
              coords.longitude = window.geo.ll[1];
              zoom = 6;
            }
          }

          var mapOptions = {
            mapTypeId: google.maps.MapTypeId.HYBRID,
            center: Position.posToLatLng({ coords: coords}),
            //zoomControl: (Platform.isBrowser && !Platform.isMobile()),
            zoomControl: true,
            zoomControlOptions: 'BOTTOM_RIGHT',
            zoom: zoom,
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

                //TODO Use this to create the localization button on the map
                //map.controls[google.maps.ControlPosition.TOP_CENTER].push(TEMPLATE);

                Maps.setFeedMap(map);

                var layer = new google.maps.FusionTablesLayer({
                  suppressInfoWindows: true,
                  query: {
                    select: 'json_4326',
                    where: 'name NOT EQUAL TO \'Canada\'',
                    // All data is from here https://www.google.com/fusiontables/DataSource?dsrcid=394713#rows:id=1
                    // Which is a copy of the Natural Earth public dataset
                    from: '1uKyspg-HkChMIntZ0N376lMpRzduIjr85UYPpQ' //Mid Def 1:50m 
                    //from: '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ' //Low Def 1:110m
                    //from: '16CTzhDWVwwqa0e5xe4dRxQ9yoyE1hVt_3ekDFQ' //Hi Def 1:10m (missing india and brazil)
                  },
                  styles:[{
                    polygonOptions: {
                      strokeColor: '#FF0000',
                      strokeOpacity: 0.1,
                      strokeWeight: 0,
                      fillColor: '#FF0000',
                      fillOpacity: 0.1
                    }
                  }]
                });
                layer.setMap(map);

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

                var layer = new google.maps.FusionTablesLayer({
                  suppressInfoWindows: true,
                  query: {
                    select: 'json_4326',
                    where: 'name NOT EQUAL TO \'Canada\'',
                    // All data is from here https://www.google.com/fusiontables/DataSource?dsrcid=394713#rows:id=1
                    // Which is a copy of the Natural Earth public dataset
                    from: '1uKyspg-HkChMIntZ0N376lMpRzduIjr85UYPpQ' //Mid Def 1:50m 
                    //from: '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ' //Low Def 1:110m
                    //from: '16CTzhDWVwwqa0e5xe4dRxQ9yoyE1hVt_3ekDFQ' //Hi Def 1:10m (missing india and brazil)
                  },
                  styles:[{
                    polygonOptions: {
                      strokeColor: '#FF0000',
                      strokeOpacity: 0.1,
                      strokeWeight: 0,
                      fillColor: '#FF0000',
                      fillOpacity: 0.1
                    }
                  }]
                });
                layer.setMap(map);

                google.maps.event.addListener(layer, 'click', function(event) {
                  Dialog.confirm('Would you like to continue anyway?', 'Sorry but instanews is currently only available in Canada', function(idx) {
                    if(idx === 1) {
                      Maps.setMarker(Maps.getPostMap(), event.latLng);
                    }
                  });
                });
                break;
              }
              case 'articleMap': {
                // istanbul ignore else
                var id = '';
                if ( $stateParams.id) {
                  scope.article = {};
                  id = Platform.url.getId($stateParams.id);
                  Articles.findById(id, function(article) {
                    scope.article = article;
                    if(article) {
                      mapOptions.center = new google.maps.LatLng(scope.article.loc.coordinates[1], scope.article.loc.coordinates[0]);
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

                Maps.setArticleMap(map, id);

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

        if(scope.map.id) {
          initializeMap();
        } else {
          var unregisterWatch = scope.$watch(attrs.map, function(newMap, oldMap) {
            if(newMap.id && newMap.id !== oldMap.id) {
              initializeMap();
              unregisterWatch();
            }
          }, true);
        }
      },
      controller: function(
        $element,
        $location,
        $scope,
        $stateParams,
        $timeout,
        Articles,
        Maps,
        Position,
        Platform,
        _
      ) {
        $scope.Platform = Platform;

        if($scope.map.id === 'feedMap') {
          var options = {
            cancel: false
          };

          var event = 'touch';
          if(Platform.isBrowser() && !Platform.isMobile()) {
            event = 'mousedown';
          }

          var mapListener = function() {
            options.cancel = true;
            $ionicGesture.off(mapGesture, event, mapListener);
          };
          var mapGesture = $ionicGesture.on(event, mapListener, $element); 

          var feed = angular.element(document.getElementById('feed'));
          var scrollListener = function() {
            options.cancel = true;
            $ionicGesture.off(scrollGesture, 'scroll', scrollListener);
          };
          var scrollGesture = $ionicGesture.on('scroll', scrollListener, feed); 

          var last = {
            pos: {
              lat: null,
              lng: null
            },
            zoom: null
          };

          var checkQuery = function(ignore) {
            var map = Maps.getFeedMap();
            if(map) {
              var query = Platform.url.getQuery($location);
              if(query && query.loc && query.loc.pos &&
                 (query.loc.pos.lat !== last.pos.lat || query.loc.pos.lng !== last.pos.lng || query.loc.zoom !== last.zoom)
                ) {
                last = query.loc;

                if(!ignore) {
                  Maps.setCenter(map, query.loc.pos);
                  map.setZoom(query.loc.zoom);
                }
              }
            }
          };

          var ignoreNextURLChange = false;
          $scope.$on('$locationChangeSuccess', function () {
            checkQuery(ignoreNextURLChange);
            if(ignoreNextURLChange) {
              ignoreNextURLChange = false;
            }
          });

          var query = Platform.url.getQuery($location);

          var localize = function () {
            var map = Maps.getFeedMap();
            if(map) {
              observer.unregister();

              checkQuery();

              //Listener on bounds changing on the map
              google.maps.event.addListener(map, 'bounds_changed', _.debounce(function() {
                if(Articles.inView) {
                  Position.setBounds(map.getBounds());

                  var loc = map.getCenter();
                  var zoom = map.getZoom();
                  $timeout(function () {
                    ignoreNextURLChange = Platform.url.setQuery($location, {
                      loc: {
                        pos: {
                          lat: loc.lat(),
                          lng: loc.lng(),
                        },
                        zoom: zoom
                      }
                    }, true);
                  });
                }
              }, 100));

              if(!query.search && !query.loc){
                Maps.localize(map, options, function(err) {
                  console.log(err);
                });
              }
            }
          };
          var observer = Maps.registerObserver(localize);
          localize();
        }
      },
      templateUrl: 'templates/directives/map.html'
    };
  }
]);
