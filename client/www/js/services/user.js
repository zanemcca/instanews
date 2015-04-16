
var app = angular.module('instanews.user', ['ionic', 'ngResource','ngCordova']);

app.service('User', [
      'LocalStorage',
      'Platform',
      'Installation',
      function(
         LocalStorage,
         Platform,
         Installation){

   var user = {};

   var observerCallbacks = [];

   var registerObserver = function(cb) {
      observerCallbacks.push(cb);
   };

   var notifyObservers = function() {
      angular.forEach(observerCallbacks, function(cb) {
         cb();
      });
   };

   var get = function() {
      return user.user;
   };

   var set = function(usr) {
      user = usr;

      notifyObservers();
      install();
   };

   var install = function() {

      var device = Platform.getDevice();

      if ( user
            && user.user
            && user.user.username
            && device
            && device.type
            && device.token
            && device.token !== 'OK') {
         console.log('Attempting to install device on the server');

         var appConfig = {
            appId: 'instanews',
            userId: user.user.username,
            deviceType: device.type,
            deviceToken: device.token,
            created: new Date(),
            modified: new Date(),
            status: 'Active'
         };

         /*
         if( device.type === 'ios') {
            appConfig.deviceToken =  device.token;
         }
         else if( device.type === 'android') {
            appConfig.deviceToken = $cordovaDevice.getUUID();
         }
         */

         Installation.create(appConfig, function (err, result) {
            if (err) {
               console.log('Error trying to install device', err);
            }
            else {
               console.log('Created a new device installation : ' , result);
            }
         });
      }
      /*
      else {
         console.log('Could not register for notification because of invalid parameters'
               + '\nUser: ' + user
               + '\ndevice.type: ' + device.type
               + '\ndevice.token: ' + device.token);
      }
      */
   };

   var clearData = function() {
      set({});
      Notifications.setNotifications([]);
      if( ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
         LocalStorage.secureDelete($cordovaDevice.getUUID());
      }
   };

   return {
      clearData: clearData,
      install: install,
      get: get,
      set: set,
      registerObserver: registerObserver
   };
}]);
