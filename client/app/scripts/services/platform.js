
'use strict';
var app = angular.module('instanews.service.platform', ['ionic', 'ngCordova']);

app.factory('Platform', [
  '$cordovaDevice',
  '$cordovaDialogs',
  '$ionicActionSheet',
  '$ionicLoading',
  '$q',
  function(
    $cordovaDevice,
    $cordovaDialogs,
    $ionicActionSheet,
    $ionicLoading,
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

    var getDeviceType = function () {
      var height = window.innerHeight;
      var type = 'phone';
      if( 900 <= height ) {
        type = 'tablet';
      }
      return type;
    };

    // Screen size logic
    var getSizeClass = function (max) {
      var pr = window.devicePixelRatio;
      var sizeClass;
      switch(getDeviceType()) {
        case 'phone':
          sizeClass = Math.floor(pr -1);
        break;
        case 'tablet':
          sizeClass = Math.floor(pr*3/2);
        break;
        default:
          sizeClass = 0;
        break;
      }

      if(max || max === 0) {
        sizeClass = Math.min(sizeClass, max);
      }
      return sizeClass;
    };

    var getSizeClassPrefix = function (max) {
      var sizes = ['XS','S','M','L'];
      if(max) {
        max = Math.min(sizes.length -1, max);
      } else {
        max = 0;
      }

      return sizes[getSizeClass(max)];
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

    var hideKeyboard = function () {
      if(cordova && cordova.plugins && cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.close();
      }
    };

    var loading = {
      show: function () {
        if(!loading.loader ) {
           loading.loader = $ionicLoading.show({
            delay: 100,
            template: 'Loading...'
          });
          return loading.loader;
        }
      },
      hide: function () {
        if(loading.loader) {
          $ionicLoading.hide();
          loading.loader = null;
        }
      }
    };

    // Initialize the platform
    ready.promise
      .then(function() {
      loading.show();

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    var getAppNameLogo = function () {
     //return '<img src="images/favicon.ico"/>stanews'; 
     return 'InstaNews'; 
    };

    return {
      hideKeyboard: hideKeyboard,
      getAppNameLogo: getAppNameLogo,
      loading: loading,
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
      getSizeClassPrefix: getSizeClassPrefix,
      ready: ready.promise
    };
  }]);

