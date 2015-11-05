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

        var service = new google.maps.places.AutocompleteService();

        var displaySuggestions = function(predictions, status) {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.log(status);
            return;
          }

          $scope.place.predictions = predictions;
        };

        var defaultPlaceholder = 'Search for a location';

        $scope.input = {
          placeholder: defaultPlaceholder 
        };

         // Localize the map on the users position
       $scope.place.localize = function() {
         $scope.input.placeholder = defaultPlaceholder;

         var cb = $scope.place.localizeCallback;
         if($scope.place.getMap instanceof Function) {
           var map;
           var delay = 100; //ms
           var timeout = 5000; // 5s

           var localizeMap = function (time) {
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

       //TODO Onclick set value to placeholder

        $scope.set = function (prediction) {
          console.log(prediction);
          $scope.place.value = prediction;
          $scope.input.value = null;
          $scope.input.placeholder = prediction.description;
        };

        $scope.search = function () {
          if($scope.input.value) {
            service.getQueryPredictions({ input: $scope.input.value }, function (predictions, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.log(status);
                return;
              }

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
            if(newValue !== oldValue) {
              if(newValue) {
                service.getQueryPredictions({ input: newValue }, displaySuggestions);
              } else {
                $scope.place.predictions.length = 0;
              }
            }
          });

          //TODO Deal with form entry

          /*
          var input = document.getElementById('search-input');
          var autocomplete = new google.maps.places.Autocomplete(input);

          //Add a listener on the search box
          google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();

            if(!place.geometry) {
              console.log('No geometry!');
              return;
            }

            var map = Maps.getPostMap();
            if(place.geometry.viewport) {
              Maps.fitBounds(map, place.geometry.viewport);
            }
            else {
              Maps.setCenter(map, place.geometry.location);
            }

            Maps.setMarker(map, place.geometry.location);

            //TODO set newArticle.place
            //or replace it
          });
         */

        });

        $scope.disableTap = function(){
          if($scope.input.placeholder !== defaultPlaceholder) {
            $scope.input.value = $scope.input.placeholder;
          }

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
