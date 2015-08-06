
'use strict';
var app = angular.module('instanews.service.platform', ['ionic', 'ngCordova']);

app.factory('Platform', [
  '$cordovaDevice',
  '$ionicActionSheet',
  '$q',
  function(
    $cordovaDevice,
    $ionicActionSheet,
    $q
  ) {


   var ready = $q.defer();

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

   var isBrowser = function() {
     var ip = ionic.Platform;
     if(ip.isIOS()) {
       return false;
     }
     else if(ip.isAndroid()) {
       return false;
     }
     else if(ip.isWindowsPhone()) {
       return false;
     }
     else {
       return true;
     }
   };

   /* Initialization */
   if(isBrowser()) {
     console.log('App is running in the browser!');
     ready.resolve();
   }
   else {
     ionic.Platform.ready( function( device ) {
        ready.resolve( device);
     });
   }

  var showToast = function(message) {
    if(!isBrowser()) {
      setTimeout( function() {
        window.plugins.toast.showShortCenter(message);
      }, 250);
    }
    console.log(message);
  };

  var showSheet = function(sheet) {
    $ionicActionSheet.show(sheet);
  };

  var getDataDir = function() {
    return cordova.file.dataDirectory;
  };

   return {
      getUUID: getUUID,
      getDataDir: getDataDir,
      showSheet: showSheet,
      showToast: showToast,
      isIOS: isIOS,
      isBrowser: isBrowser,
      getDevice: getDevice,
      setDevice: setDevice,
      setDeviceToken: setDeviceToken,
      ready: ready.promise
   };
}]);

