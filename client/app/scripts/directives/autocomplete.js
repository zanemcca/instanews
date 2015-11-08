'use strict';

var app = angular.module('instanews.directive.autocomplete', ['ionic', 'ngResource']);

app.directive('inautocomplete', [
  'Platform',
  'Maps',
  function (
    Platform,
    Maps
  ) {

    return {
      restrict: 'E',
      scope: {
        place: '='
      },
      controller: function($scope) {

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

        $scope.place.predictions = [];

        var service = new google.maps.places.AutocompleteService();

        var displaySuggestions = function(predictions, status) {
          // istanbul ignore if
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.log(status);
            return;
          }

          $scope.place.predictions = predictions;
          $scope.safeApply();
        };

        var defaultPlaceholder = 'Search for a location';

        $scope.input = {
          placeholder: defaultPlaceholder 
        };

        // Localize the map on the users position
        $scope.place.localize = function() {
          $scope.done = true;
          $scope.input.value = null;
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
                setTimeout(function () {
                  map = $scope.place.getMap();
                  if(map) {
                    Maps.localize(map, cb);
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

        $scope.set = function (prediction) {
          $scope.done = true;
          console.log(prediction);
          $scope.place.value = prediction;
          $scope.input.value = null;
          $scope.input.placeholder = prediction.description;
          $scope.safeApply();
        };

        $scope.done = true;

        $scope.search = function () {
          $scope.done = true;
          if($scope.input.value) {
            service.getQueryPredictions({ input: $scope.input.value }, function (predictions, status) {
              // istanbul ignore  if 
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.log(status);
                return;
              }

              // istanbul ignore else 
              if(predictions.length) {
                $scope.set(predictions[0]);
              } else {
                console.log('Invalid location. Please try again');
              }
            });
          }

          Platform.hideKeyboard();
        };

        Platform.ready
        .then( function() {

          $scope.$watch(function (scope) {
            return scope.input.value;
          }, function (newValue, oldValue) {
            // istanbul ignore else 
            if(newValue !== oldValue) {
              if(newValue) {
                service.getQueryPredictions({ input: newValue }, displaySuggestions);
                $scope.done = false;
              } else {
                $scope.done = true;
                $scope.place.predictions.length = 0;
              }
            }
          });
        });

        $scope.click = function () {
          // istanbul ignore else 
          if($scope.done) {
            // istanbul ignore else 
            if($scope.input.placeholder !== defaultPlaceholder) {
              $scope.input.value = $scope.input.placeholder;
            }
          }
        };

        $scope.disableTap = function(){
          console.log('Disabling tap');
          var container = document.getElementsByClassName('pac-container');
          // disable ionic data tab
          angular.element(container).attr('data-tap-disabled', 'true');
          // leave input field if google-address-entry is selected
          angular.element(container).on('click', function(){
            document.getElementById('search-input').blur();
          });
        };
      },
      templateUrl: 'templates/directives/autocomplete.html'
    };
  }]);
