
'use strict';
var app = angular.module('instanews.notifications', ['ionic', 'ngResource','ngCordova']);

app.service('Notifications', [
      '$rootScope',
      '$cordovaPush',
      'Platform',
      'User',
      '$filter',
      '$cordovaDialogs',
      function(
         $rootScope,
         $cordovaPush,
         Platform,
         User,
         $filter,
         $cordovaDialogs){

   var notifications = [];

   $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {

      console.log('Notification recieved');

      if(ionic.Platform.isIOS()) {
         iosPushHandler(notification);
      }
      else if (ionic.Platform.isAndroid()) {
         androidPushHandler(notification);
      }
      else {
         console.log('Unkown platform cannot handle notification!');
      }
   });

   var iosPushHandler = function(notification) {
      if(notification.alert) {
         notification.message = notification.alert;
      }
      notifications.push(notification);
      notifyObservers();

      $cordovaDialogs.alert(notification.message, 'instanews', 'Fuck yeah!')
      .then( function() {
         console.log('Notifcation is confirmed');
      });

   };

   var androidPushHandler = function(notification) {
      if( notification.event === 'registered' ) {
         Platform.setDeviceToken(notification.regid);
         User.install();
      }
      else if (notification.event === 'message') {
         //Save the notification
         notifications.push(notification);
         notifyObservers();

         $cordovaDialogs.alert(notification.message, 'instanews', 'Fuck yeah!')
         .then( function() {
            console.log('Notifcation is confirmed');
         });
      }
      else {
         console.log('Un-handled notification!');
      }
   };

   var get = function() {
      return notifications;
   };

   var set = function(notes) {
      notifications = notes;
      notifyObservers();
   };

   var observerCallbacks = [];

   var registerObserver = function(cb) {
      observerCallbacks.push(cb);
   };

   var notifyObservers = function() {
      angular.forEach(observerCallbacks, function(cb) {
         cb();
      });
   };

   var getOne = function (id) {
      var val = $filter('filter')(notifications, {id: id});
      if (val.length > 0) {
         return val[0];
      }
   };

   return {
      set: set,
      get: get,
      getOne: getOne,
      registerObserver: registerObserver
   };
}]);
