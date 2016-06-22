
'use strict';
var app = angular.module('instanews.service.device', ['ionic', 'ngCordova']);

app.factory('Device', [
  '$cordovaDevice',
  function(
    $cordovaDevice
  ) {

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

    var isAndroid = function() {
      return ionic.Platform.isAndroid();
    };

    var isAndroid6 = function() {
      var version = ionic.Platform.version();
      return (isAndroid() && version >= 6);
    };

    var isBrowser = function() {
      var ip = ionic.Platform;
      if((ip && window.cordova)) {
        if(ip.isIOS() || ip.isAndroid() || ip.isWindowsPhone()) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    };

    var isMobile = function() {
      var ip = ionic.Platform;
      return (ip && (ip.isIOS() || ip.isAndroid() || ip.isWindowsPhone()));
    };

    var getDataDir = function() {
      return cordova.file.dataDirectory;
    };

    var getCacheDir = function() {
      return cordova.file.cacheDirectory;
    };

    var isCameraPresent = function () {
      return (navigator.camera && navigator.camera.getPicture);
    };

    var isVideoPresent = function () {
      return (navigator.device && navigator.device.capture && navigator.device.capture.captureVideo);
    };

    var scrollBarWidth = -1;
    var getScrollBarWidth = function() {
      if(scrollBarWidth < 0) {
        var inner = document.createElement('p');
        inner.style.width = '100%';
        inner.style.height = '200px';

        var outer = document.createElement('div');
        outer.style.position = 'absolute';
        outer.style.top = '0px';
        outer.style.left = '0px';
        outer.style.visibility = 'hidden';
        outer.style.width = '200px';
        outer.style.height = '150px';
        outer.style.overflow = 'hidden';
        outer.appendChild (inner);

        document.body.appendChild (outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 === w2) {
          w2 = outer.clientWidth;
        }

        document.body.removeChild (outer);

        scrollBarWidth = (w1 - w2);
      }
      return scrollBarWidth;
    };

    var getWidth = function (element) {
      if(element) {
        return element.clientWidth;
      } else {
        return window.innerWidth;
      }
    }; 

    var getMaxImageDimensions = function (parentElement) {
      var res = {
        height: 0,
        width: 0
      };

      var width = getWidth(parentElement) - getScrollBarWidth();
      if(width >= 768) {
        res.width = 600;
      } else if(isTablet()) {
        res.width = Math.round(width*0.8);
      } else {
        res.width = width - 20;
      }

      var max = Math.max(window.innerWidth, window.innerHeight);
      if(parentElement) {
        max = Math.max(parentElement.clientWidth, parentElement.clientHeight);
      }

      if(max < 500) {
        res.height = 300;
      } else if(max < 600) {
        res.height = 500;
      } else if(max < 700) {
        res.height = 600;
      } else if(max < 800) {
        res.height = 700;
      } else {
        res.height = 800;
      }
      return res;
    };

    var isLandscape = function () {
      var isLandscape = false;
      if(typeof(window.orientation) === 'number') {
        isLandscape = (window.orientation % 180);
      } else {
        isLandscape = (window.innerHeight < window.innerWidth);
      }

      return isLandscape;
    };

    var getDeviceType = function () {
      var height = Math.max(window.innerHeight, window.innerWidth);
      var type = 'phone';
      if(height  >= 900) {
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
          sizeClass = Math.ceil(pr*3/2);
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

    var isTablet = function () {
      return 'tablet' === getDeviceType();
    };

    var getAppNameLogo = function () {
     //return '<img src="images/favicon.ico"/>stanews'; 
     return 'InstaNews'; 
    };

    return {
      getAppNameLogo: getAppNameLogo,
      getUUID: getUUID,
      getDataDir: getDataDir,
      getCacheDir: getCacheDir,
      isIOS: isIOS,
      isAndroid: isAndroid,
      isAndroid6: isAndroid6,
      isBrowser: isBrowser,
      isMobile: isMobile,
      isCameraPresent: isCameraPresent,
      isVideoPresent: isVideoPresent,
      isTablet: isTablet,
      isLandscape: isLandscape,
      getWidth: getWidth,
      getMaxImageDimensions: getMaxImageDimensions,
      getDevice: getDevice,
      setDevice: setDevice,
      setDeviceToken: setDeviceToken,
      getSizeClassPrefix: getSizeClassPrefix
    };
  }
]);
