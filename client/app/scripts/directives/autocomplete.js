'use strict';

var app = angular.module('instanews.directive.autocomplete', ['ionic', 'ngResource']);

var isIOS;
// jshint unused: false
function selectText(id) {
  setTimeout(function() {
    var input = document.getElementById(id);
    if(input) {
      input.focus();
      if(!isIOS || !isIOS()) {
        input.select();
      } else if(input.value.length) {
        input.setSelectionRange(0, input.value.length);
      }
    } else {
      console.log('Cannot find input!');
    }
  });
}

app.directive('inautocomplete', [
  '_',
  'Platform',
  'Maps',
  function (
    _,
    Platform,
    Maps
  ) {

    return {
      restrict: 'E',
      scope: {
        searchId: '@',
        place: '='
      },
      controller: function(
        $scope,
        $timeout,
        $location,
        Maps
      ) {
        // istanbul ignore next
        $scope.safeApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };

        $scope.isIOS = Platform.isIOS;
        isIOS = Platform.isIOS;

        $scope.Platform = Platform;

        $scope.place.predictions = [];

        var defaultPlaceholder = 'Search for a location';

        $scope.input = {
          value: '', 
          placeholder: defaultPlaceholder 
        };

        // Localize the map on the users position
        /*
        $scope.place.localize = function (zoom) {
          $scope.done = true;
          $scope.input.value = '';
          $scope.input.placeholder = defaultPlaceholder;

          var cb = $scope.place.localizeCallback;
          // istanbul ignore else 
          if($scope.place.getMap instanceof Function) {
            var map;
            var delay = 100; //ms
            var timeout = 5000; // 5s

            var localizeMap = function (time) {
              // istanbul ignore else 
              if(time > 0) {
                $timeout(function () {
                  map = $scope.place.getMap();
                  if(map) {
                    Maps.localize(map, zoom, cb);
                  } else {
                    localizeMap(time - delay);
                  }
                } , delay);
              } else {
                console.log('No Map found in ' + timeout + ' ms');
              }
            };

            localizeMap(timeout);
          }
          else {
            console.log('Map not valid! Cannot localize!');
          }
        };
       */

        $scope.place.onLocalize = function () {
          $scope.done = true;
          $scope.input.value = '';
          $scope.input.placeholder = defaultPlaceholder;
        };

        $scope.localize = function () {
          if($scope.place.post) {
            $scope.place.localize({ zoom: 18 }, function(pos) {
              if(pos) {
                Maps.setMarker($scope.place.getMap(), pos);
              }
            });
          } else {
            $scope.place.localize();
          }
        };

        var boundsListener;
        $scope.set = function (prediction, shouldReplace) {
          $scope.done = true;
          console.log(prediction);

          $scope.place.value = prediction;

          $scope.input.value = '';
          $scope.input.placeholder = prediction.description;

          if($scope.searchId.indexOf('feed') > -1) {
            Platform.url.setQuery($location, {
              search: prediction.description
            }, shouldReplace);

            $timeout(function () {
              if(boundsListener) {
                google.maps.event.removeListener(boundsListener);
              }
              boundsListener = google.maps.event.addListener(Maps.getFeedMap(), 'bounds_changed', function() {
                Platform.url.setQuery($location,{ search: null });
                google.maps.event.removeListener(boundsListener);
              });
            }, 5000);
          }

          $scope.safeApply();
        };

        $scope.done = true;

        $scope.search = _.debounce(function (input, locationChanged) {
          input = input || $scope.input.value;
          $scope.done = true;
          if(input && input.length > 0) {
            Maps.autocomplete(input, $scope.place, function (predictions) {
              // istanbul ignore else 
              if(predictions && predictions.length) {
                $scope.set(predictions[0], locationChanged);
              } else {
                console.log('Invalid location. Please try again');
              }
            });
          }
          Platform.keyboard.hide();
        }, 100, true);

        var lastSearch;
        var checkQuery = function(locationChanged) {
          var query = Platform.url.getQuery($location);
          if(query && query.search && query.search !== lastSearch) {
            console.log('Searching: ' + query.search);
            lastSearch = query.search;
            $scope.search(query.search, locationChanged);
          }
        };

        $scope.$on('afterEnter', function () {
          checkQuery();
        });

        $scope.$on('$locationChangeSuccess', function () {
          checkQuery(true);
        });


        Platform.ready
        .then( function() {
          $scope.$watch(function (scope) {
            return scope.input.value;
          }, function (newValue, oldValue) {
            // istanbul ignore else 
            if(newValue !== oldValue) {
              if(!newValue) {
                $scope.input.value = '';
              } else if(newValue.length) {
                Maps.autocomplete($scope.input.value, $scope.place, function (predictions){
                  if(predictions) {
                    $scope.place.predictions = predictions;
                    $scope.done = false;
                    $scope.safeApply();
                  } else {
                    $scope.place.predictions = [];
                    $scope.done = true;
                    $scope.safeApply();
                  }
                });
              } else {
                $scope.place.predictions = [];
                $scope.done = true;
                $scope.safeApply();
              }
            }
          });
        });


        $scope.blur = function() {
          if(!$scope.done) {
            $scope.input.value = '';
            $scope.place.predictions = [];
            $scope.done = true;
            $scope.safeApply();
          }
        };

        $scope.click = function () {
          // istanbul ignore else 
          if($scope.done) {
            // istanbul ignore else 
            if($scope.input.placeholder !== defaultPlaceholder) {
              $scope.input.value = $scope.input.placeholder;
            }
            selectText($scope.searchId);
          }
        };

        $scope.disableTap = function(){
          console.log('Disabling tap');
          var container = document.getElementsByClassName('pac-container');
          // disable ionic data tab
          angular.element(container).attr('data-tap-disabled', 'true');
          // leave input field if google-address-entry is selected
          angular.element(container).on('click', function(){
            document.getElementById($scope.searchId).blur();
          });

        };
      },
      templateUrl: 'templates/directives/autocomplete.html'
    };
  }
]);
