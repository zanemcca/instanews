
'use strict';
var app = angular.module('instanews.service.platform', ['ionic', 'ngCordova']);

app.factory('Platform', [
  '$cordovaDevice',
  '$cordovaDialogs',
  '$ionicActionSheet',
  '$q',
  function(
    $cordovaDevice,
    $cordovaDialogs,
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

  var showAlert = function (message, title, cb) {
    if(!cb) {
      cb = function () {
        console.log('Dialog was confirmed');
      };
    }

    $cordovaDialogs.alert(message, title, 'Ok')
    .then(cb);
  };

  var getDataDir = function() {
    return cordova.file.dataDirectory;
  };

  var isCameraPresent = function () {
    return (navigator.camera && navigator.camera.getPicture);
  };

  var isVideoPresent = function () {
    return (navigator.device && navigator.device.capture && navigator.device.capture.captureVideo);
  };

   /* Initialization */
   if(isBrowser()) {
     console.log('App is running in the browser!');
     ready.resolve();
   }
   else {
     ionic.Platform.ready( function( device ) {
        /* jshint undef:false */
        if(navigator.connection && navigator.connection.type === Connection.NONE) {
          Platform.showAlert('Instanews is unavailable offline. Please try again later', 'Sorry', function () {
            if(navigator.app) {
              navigator.app.exitApp();
            }
          });
        } else {
          ready.resolve( device);

          setTimeout(function () {
            console.log('Splashscreen timeout');
            if(navigator.splashscreen) {
              navigator.splashscreen.hide();
            }
          }, 5000);
        }
     });
   }


   return {
      getUUID: getUUID,
      getDataDir: getDataDir,
      showSheet: showSheet,
      showAlert: showAlert,
      showToast: showToast,
      isIOS: isIOS,
      isBrowser: isBrowser,
      isCameraPresent: isCameraPresent,
      isVideoPresent: isVideoPresent,
      getDevice: getDevice,
      setDevice: setDevice,
      setDeviceToken: setDeviceToken,
      ready: ready.promise
   };
}]);

