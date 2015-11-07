// Ionic Starter App
'use strict';
/*jshint camelcase: false */

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('instanews', [
      'ionic',
      'config',
      'instanews.controller.article',
      'instanews.controller.feed',
      'instanews.controller.login',
      'instanews.controller.notification',
      'instanews.controller.post',
      'instanews.controller.profile',
      'instanews.directive.autocomplete',
      'instanews.directive.comments',
      'instanews.directive.list',
      'instanews.directive.map',
      'instanews.directive.media',
      'instanews.directive.upload',
      'instanews.directive.votes',
      'instanews.service.articles',
      'instanews.service.camera',
      'instanews.service.fileTransfer',
      'instanews.service.localStorage',
      'instanews.service.maps',
      'instanews.service.navigate',
      'instanews.service.notifications',
      'instanews.service.platform',
      'instanews.service.position',
      'instanews.service.post',
      'instanews.service.subarticles',
      'instanews.service.upload',
      'instanews.service.user',
      'lbServices',
      'ui.router',
      'ngCordova'])

.config(['LoopBackResourceProvider','ENV',
    function(LoopBackResourceProvider, ENV) {
       LoopBackResourceProvider.setUrlBase(ENV.apiEndpoint);
    }
])

//TODO Revamp this to use services where available.
//TODO Disable all notification related everything
.controller('AppCtrl', [
   '$scope',
   '$state',
   '$cordovaPush',
   '$cordovaDevice',
   'LoopBackAuth',
   'Navigate',
   'Notifications',
   'User',
   'LocalStorage',
   'Journalist',
   'Platform',
   function ($scope,
      $state,
      $cordovaPush,
      $cordovaDevice,
      LoopBackAuth,
      Navigate,
      Notifications,
      User,
      LocalStorage,
      Journalist,
      Platform) {


      $scope.notifications = [];

      var updateNotifications = function() {
         $scope.notifications = Notifications.get();
      };

      Notifications.registerObserver(updateNotifications);

      //Update user function
      var updateUser = function() {
         $scope.user = User.get();
         //TODO Fix race condition between logging in and asking for notifications
         loadNotifications();
      };

      //Set up an observer on the user model
      User.registerObserver(updateUser);

      $scope.home = function() {
         Navigate.disableNextBack();
         $state.go('app.home');
      };

      //Load the login page
      $scope.login = function() {
         Navigate.disableNextBack();
         $state.go('app.login');
      };

      //Logout
      $scope.logout = function() {

         Journalist.logout()
         .$promise
         .then( function(res) {
            User.clearData();
            Notifications.set([]);
            console.log('Logged out: ' + res);
         });
      };

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

      Platform.ready
      .then(function() {
        Platform.loading.show();

         // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
         // for form inputs)
         /*
         if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
         }
         */

         /*
         if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
         }
         */
         /*
         var UUID = $cordovaDevice.getUUID();

         LocalStorage.secureRead(UUID, function(err, session) {

            if(session) {
         */
         //TODO This should be in the user service
         if(LoopBackAuth.accessTokenId && LoopBackAuth.currentUserId) {
               //Request a new token that expires in 2 weeks
               //Journalist.accessTokens.create({
               Journalist.prototype$__create__accessTokens({
                  id: LoopBackAuth.currentUserId,
                  ttl: 1209600
               }, null, function(user) {
                  User.set(user);
               }, function(err) {
                  console.log('Error: Cannot create token for user: ' + err);
                  //LocalStorage.secureDelete(UUID);
               });
            }
         /*
          //NOTIFICATION SETUP CRAP
            else {

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
            */

      });

   }])

.config(function(
  $stateProvider,
  $urlRouterProvider,
  $ionicConfigProvider
) {

   //No transitions for performance
   $ionicConfigProvider.views.transition('none');

   //Setup back button to not have text
   $ionicConfigProvider.backButton.text('').previousTitleText(false);

   //$ionicConfigProvider.tabs.position('bottom'); //Places them at the bottom for all OS
   //$ionicConfigProvider.tabs.style('standard'); //Makes them all look the same across all OS
   //$ionicConfigProvider.backButton.previousTitleText(false).text('');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

   .state('app', {
      url:'/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
   })

   .state('app.feed', {
      url:'/feed',
      views: {
         'menuContent' : {
            templateUrl: 'templates/feed.html',
            controller: 'FeedCtrl'
         }
      }
   })

   .state('app.article', {
      url: '/articles/{id}',
      views: {
         'menuContent' : {
            templateUrl: 'templates/article.html',
            controller: 'ArticleCtrl'
         }
      }
   })

   .state('app.notif', {
      cache: false,
      url: '/notif/{id}',
      views: {
         'menuContent' : {
            templateUrl: 'templates/notif.html',
            controller: 'NotificationCtrl'
         }
      }
   })

   .state('app.profile', {
      url:'/profile/{username}',
      views: {
         'menuContent' : {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
         }
      }
   })

   .state('app.login', {
      url: '/login',
      views: {
         'menuContent' : {
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
         }
      }
   })

   .state('articlePost', {
      cache: false,
      url: '/post/article',
      templateUrl: 'templates/articlePost.html',
      controller: 'PostCtrl'
   })

   .state('subarticlePost', {
      cache: false,
      url: '/post/article/{id}',
      templateUrl: 'templates/subarticlePost.html',
      controller: 'PostCtrl'
   });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/feed');

});
