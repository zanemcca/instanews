
var app = angular.module('instanews.platform', ['ionic']);

app.factory('Platform', function( $q ) {
   var ready = $q.defer();

   ionic.Platform.ready( function( device ) {
      ready.resolve( device);
   });

   return {
      ready: ready.promise
   }
});

