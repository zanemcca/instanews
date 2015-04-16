// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('instanews', [
      'ionic',
      'instanews.common',
      'instanews.localStorage',
      'instanews.article',
      'instanews.feed',
      'instanews.votes',
      'instanews.login',
      'instanews.comments',
      'instanews.map',
      'instanews.data',
      'instanews.camera',
      'instanews.post',
      'instanews.profile',
      'instanews.platform',
      'lbServices',
      'ui.router',
      'ngCordova'])

.run(['$ionicPlatform',function($ionicPlatform) {
}])

.controller('AppCtrl', [
   '$scope',
   '$state',
   '$cordovaPush',
   '$cordovaDevice',
   'Common',
   'LocalStorage',
   'Journalist',
   'Platform',
   function ($scope,
      $state,
      $cordovaPush,
      $cordovaDevice,
      Common,
      LocalStorage,
      Journalist,
      Platform) {

      Platform.ready
      .then(function() {

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

         var config = {};

         var device = Common.getDevice();

         if( ionic.Platform.isAndroid()) {
            config = {
               senderID: '1081316781214'
            }
            device.type = 'android';
         }
         else if( ionic.Platform.isIOS()) {
            config = {
               badge: true,
               sounde: true,
               alert: true
            }
            device.type = 'ios';
         }
         else {
            console.log('Cannot register! Unknown device!');
            return;
         }

         var UUID = $cordovaDevice.getUUID();

         LocalStorage.secureRead(UUID, function(err, session) {

            if(session) {
               //Request a new token that expires in 2 weeks
               Journalist.prototype$__create__accessTokens({
                  id: session.user.user.username,
                  ttl: 1209600
               }, null, function(user) {
                  session.user.id = user.id;
                  session.user.created = user.created;
                  session.user.ttl = user.ttl;
                  Common.setUser(session.user);
               }, function(err) {
                  console.log('Error: Cannot create token for user: ' + err);
                  LocalStorage.secureDelete(UUID);
               });
            }
            else {
               console.log('Attempting to register device for push notifications');
               $cordovaPush.register(config)
               .then( function (res) {

                  console.log('Registered for push notification with cordovaPush: ', res);
                  device.token = res;
                  Common.setDevice(device);

               }, function(err) {
                  console.log(err);
               });
            }
         });

      });


      $scope.notifications = [];

      var updateNotifications = function() {
         $scope.notifications = Common.getNotifications();
      };

      Common.registerNotificationObserver(updateNotifications);

      //Update user function
      var updateUser = function() {
         $scope.user = Common.getUser();
         loadNotifications();
      };

      //Set up an observer on the user model
      Common.registerUserObserver(updateUser);

      $scope.home = function() {
         Common.disableNextBack();
         $state.go('app.home');
      };

      //Load the login page
      $scope.login = function() {
         Common.disableNextBack();
         $state.go('app.login');
      };

      //Logout
      $scope.logout = function() {

         Journalist.logout()
         .$promise
         .then( function(res) {
            Common.clearUserData();
            console.log('Logged out');
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
               Common.setNotifications(res);
            });
         }
         else {
            console.log('Cannot load notifications because user is not set yet');
         }
      };

   }])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

   //No transitions for performance
   $ionicConfigProvider.views.transition('none');

   //Setup back button to not have text
   $ionicConfigProvider.backButton.text('').previousTitleText(false);

//   $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
//   $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

   //$ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
   //$ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
   //$ionicConfigProvider.backButton.previousTitleText(false).text('');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

   .state('app', {
      url:'/app',
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: "AppCtrl"
   })

   .state('app.feed', {
      url:'/feed',
      views: {
         'menuContent' : {
            templateUrl: "templates/feed.html",
            controller: "FeedCtrl"
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

   .state('app.profile', {
      url:'/profile/{username}',
      views: {
         'menuContent' : {
            templateUrl: "templates/profile.html",
            controller: "ProfileCtrl"
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
      url: '/post/article',
      templateUrl: 'templates/articlePost.html',
      controller: 'PostCtrl'
   })

   .state('subarticlePost', {
      url: '/post/article/{id}',
      templateUrl: 'templates/subarticlePost.html',
      controller: 'PostCtrl'
   })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/feed');

});
