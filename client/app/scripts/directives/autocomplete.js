'use strict';

var app = angular.module('instanews.autocomplete', ['ionic', 'ngResource']);

app.directive('inautocomplete', [
  'Platform',
  'Maps',
  function (Platform, Maps) {

   return {
      restrict: 'E',
      scope: {
         owner: '='
      },
      controller: function($scope) {

        Platform.ready
        .then( function() {
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
        });

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
