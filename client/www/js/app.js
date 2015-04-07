// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('instanews', [
      'ionic',
      'instanews.common',
      'instanews.article',
      'instanews.feed',
      'instanews.votes',
      'instanews.login',
      'instanews.comments',
      'instanews.map',
      'instanews.data',
      'instanews.camera',
      'instanews.post',
      'lbServices',
      'ui.router'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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
})

.controller('AppCtrl', [
   '$scope',
   '$location',
   'Common',
   'Journalist',
   function ($scope, $location, Common, Journalist) {

      //Update user function
      var updateUser = function() {
         $scope.user = Common.getUser();
      };

      //Set up an observer on the user model
      Common.registerUserObserver(updateUser);

      //Load the login page
      $scope.login = function() {
         $location.path('login');
      };

      //Logout
      $scope.logout = function() {

         Journalist.logout()
         .$promise
         .then( function(res) {
            Common.setUser({});
            console.log('Logged out');
         });
      };
   }])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

   //No transitions for performance
   $ionicConfigProvider.views.transition('none');

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

   .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
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
  if ( true ) {
     $urlRouterProvider.otherwise('/login');
  }
  else {
     $urlRouterProvider.otherwise('/feed');
  }

});
