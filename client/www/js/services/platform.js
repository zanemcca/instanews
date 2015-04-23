
var app = angular.module('instanews.platform', ['ionic', 'ngCordova']);

app.factory('Platform', [
      '$cordovaDevice',
      '$q',
      function($cordovaDevice,
         $q) {


   var ready = $q.defer();

   ionic.Platform.ready( function( device ) {
      ready.resolve( device);
   });

   var device = {
      type: '',
      token: ''
   };

   var getDevice = function() {
      return device;
   };

   var setDevice = function(dev) {
      device = dev;
   };

   var setDeviceToken = function(token) {
      device.token = token;
   };

   var getUUID = function() {
      if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
         return $cordovaDevice.getUUID();
      }
      return;
   };

   var isIOS = function() {
      return ionic.Platform.isIOS();
   };

   return {
      getUUID: getUUID,
      isIOS: isIOS,
      getDevice: getDevice,
      setDevice: setDevice,
      setDeviceToken: setDeviceToken,
      ready: ready.promise
   };
}]);

