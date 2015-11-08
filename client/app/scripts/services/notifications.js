
'use strict';
var app = angular.module('instanews.service.notifications', ['ionic', 'ngResource','ngCordova']);

/* istanbul ignore next */
app.service('Notifications', [
      '$rootScope',
      '$cordovaPush',
      'Platform',
      'User',
      '$filter',
      function(
         $rootScope,
         $cordovaPush,
         Platform,
         User,
         $filter
         ){
        //NOTIFICATION STUFF FROM APP.JS
      /*
      $scope.notifications = [];

      var updateNotifications = function() {
         $scope.notifications = Notifications.get();
      }; 

      //Notifications.registerObserver(updateNotifications);
      */
      /*
      $scope.handleNotification = function(note) {
         if(note.notifiableType === 'article') {
            $state.go('app.article',{ id: note.notifiableId});
         }
         else {
            $state.go('app.notif', { id: note.id});
         }
         Navigate.toggleMenu();
         note.seen = true;

         Journalist.notifications.updateById({
            id: $scope.user.username,
            fk: note.id,
         },note ).$promise
         .then(function(res) {
            console.log('Notification updated: ' + res);
         });
      };

      var loadNotifications = function() {
         if( $scope.user && $scope.user.username ){
            var filter = {
               limit: 25,
               skip: 0,
               order: 'date DESC',
            };

            Journalist.prototype$__get__notifications({
               id: $scope.user.username,
               filter: filter
            }).$promise
            .then( function(res) {
               Notifications.set(res);
            });
         }
         else {
            console.log('Cannot load notifications because user is not set yet');
         }
      };
     */
         /*
           var registerPush = function () {
         var config = {};

         var device = Platform.getDevice();

         if( ionic.Platform.isAndroid()) {
            config = {
               senderID: '1081316781214'
            };
            device.type = 'android';
         }
         else if( ionic.Platform.isIOS()) {
            config = {
               badge: true,
               sounde: true,
               alert: true
            };
            device.type = 'ios';
         }
         else {
            console.log('Cannot register! Unknown device!');
            return;
         }

               console.log('Attempting to register device for push notifications');
               $cordovaPush.register(config)
               .then( function (res) {

                  console.log('Registered for push notification with cordovaPush: ', res);
                  device.token = res;
                  Platform.setDevice(device);

               }, function(err) {
                  console.log(err);
               });
            }
         });
         };
            */


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

      Platform.showAlert(notification.message, 'Notification');
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

         Platform.showAlert(notification.message, 'Notification');
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
