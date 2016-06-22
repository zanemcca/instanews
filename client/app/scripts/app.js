// Ionic Starter App
'use strict';
/*jshint camelcase: false */

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

document.onclick = function(e) {
  e = e || window.event;
  var element = e.target || e.srcElement;

  if(element.tagName ==='A') {
    console.log('Opening ' + element.href + ' in in-app-browser');
    window.open(element.href, '_blank', 'location=no,scrollbars=yes');
    return false;
  } else if(element.tagName === 'IMG' && element.src.indexOf('maps') > -1) {
    var grandparent = element.parentElement.parentElement;
    if(grandparent.tagName === 'A') {
      console.log('Opening ' + grandparent.href + ' in in-app-browser');
      window.open(grandparent.href, '_blank', 'location=no,scrollbars=yes');
      return false;
    }
  }
};

angular.module('instanews', [
  'ionic',
  'config',
  'instanews.controller.article',
  'instanews.controller.feed',
  'instanews.controller.login',
  //'instanews.controller.notification',
  'instanews.controller.post',
//  'instanews.controller.profile',
  'instanews.directive.autocomplete',
  'instanews.directive.comments',
  'instanews.directive.feedback',
  'instanews.directive.list',
  'instanews.directive.map',
  'instanews.directive.media',
  'instanews.directive.speedDial',
  'instanews.directive.sidemenu',
  'instanews.directive.scrollTop',
  'instanews.directive.textFooter',
  'instanews.directive.upload',
  'instanews.directive.votes',
  'instanews.service.activity',
  'instanews.service.articles',
  'instanews.service.camera',
  'instanews.service.comments',
  'instanews.service.device',
  'instanews.service.dialog',
  'instanews.service.fileTransfer',
  'instanews.service.imageCache',
  'instanews.service.list',
  'instanews.service.localStorage',
  'instanews.service.maps',
  'instanews.service.navigate',
  'instanews.service.notifications',
  'instanews.service.observable',
  'instanews.service.platform',
  'instanews.service.position',
  'instanews.service.preload',
  'instanews.service.preloadQueue',
  'instanews.service.post',
  'instanews.service.subarticles',
  'instanews.service.shares',
  'instanews.service.textInput',
  'instanews.service.uploads',
  'instanews.service.user',
  'instanews.service.votes',
  'instanews.terms',
  'lbServices',
  'ui.router',
  'angularMoment',
  'ngCordova'
])

.config([
  'LoopBackResourceProvider',
  'ENV',
  // istanbul ignore next
  function(LoopBackResourceProvider, ENV) {
    LoopBackResourceProvider.setUrlBase(ENV.apiEndpoint);
  }
])

.constant(
  '_',
  window._
)

//Return should closing keyboard with return
.directive('input', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      'returnClose': '=',
      'onReturn': '&',
      'onFocus': '&',
      'onBlur': '&'
    },
    link: function(scope, element) {
      element.bind('focus', function() {
        if(scope.onFocus) {
          $timeout(function() {
            scope.onFocus();
          });
        }
      });

      element.bind('blur', function() {
        if(scope.onBlur) {
          $timeout(function() {
            scope.onBlur();
          });
        }
      });

      element.bind('keydown', function(e) {
        if(e.which === 13) {
          if (scope.returnClose) {
            element[0].blur();
          }
          if(scope.onReturn) {
            $timeout(function() {
              scope.onReturn();
            });
          }
        }
      });
    }
  };
})

.controller('AppCtrl', [
  '$q',
  '_',
  '$ionicModal',
  '$scope',
  'Navigate',
  'Notifications',
  'Platform',
  'Post',
  'Terms',
  'User',
  'Uploads',
  function (
    $q,
    _,
    $ionicModal,
    $scope,
    Navigate,
    Notifications,
    Platform,
    Post,
    Terms,
    User,
    Uploads
  ) {

    $scope.Notifications = Notifications.getLoader({
      keepSync: true
    });

    //Update user function
    var updateUser = function() {
      $scope.user = User.get();
    };

    //Set up an observer on the user model
    User.registerObserver(updateUser);

    $scope.login = function () {
      if( $scope.aboutModal ){
        $scope.aboutModal.hide();
      }
      return User.login();
    };

    $scope.showConversations = function () {
      Platform.support.clearData();
      Platform.support.showConversations();
    };

    $scope.showFAQ = function () {
      Platform.support.clearData();
      Platform.support.show();
    };

    $scope.logout = User.logout;

    $scope.Navigate = Navigate;
    $scope.pending = [];

    $scope.Uploads = Uploads;
    $scope.Post = Post;

    //Retry failed uploads
    $scope.retry = _.debounce(function() {
      var Uplds = Uploads.getPending();

      var postCB = function (err) {
        if(err) {
          console.log(err);
        }
      };

      for(var j in Uplds) { 
        var article = Uplds[j];
        var id = article.spec.options.id;
        var uploads = article.uploads.get();
        for(var i in uploads) {
          if(!uploads[i].resolved) {
            uploads[i].complete = $q.defer();
            uploads[i].resolve();
          }
        }

        Post.post(article.uploads, id, postCB);
      }
    }, 300);

    $scope.Platform = Platform;
    $scope.Terms = Terms;

     $ionicModal.fromTemplateUrl('templates/modals/pending.html', {
        scope: $scope,
        animation: 'slide-in-up'
     }).then( function (modal) {
        $scope.pendingModal = modal;
     });

     $ionicModal.fromTemplateUrl('templates/modals/about.html', {
        scope: $scope,
        animation: 'slide-in-up'
     }).then( function (modal) {
        $scope.aboutModal = modal;
     });
  }
])

.controller('NavCtrl', [
  '$scope',
  'Navigate',
  function (
    $scope,
    Navigate
  ) {
    $scope.Navigate = Navigate;
  }
])

.config(function(
  $stateProvider,
  $locationProvider,
  $urlRouterProvider,
  $ionicConfigProvider,
  $mdGestureProvider
) {
  if(!window.cordova) {
    $locationProvider.html5Mode(true);
  }

  $ionicConfigProvider.views.forwardCache(true);

  // Fix ionic ng-click from firing twice when using ngMaterial
  $mdGestureProvider.skipClickHijack();

  // jshint undef: false
  moment.locale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: '%d sec',
      m: 'a minute',
      mm: '%d minutes',
      h: 'an hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years'
    }
  }); 

  //$ionicConfigProvider.views.transition('none');

  //Setup back button to not have text
  $ionicConfigProvider.backButton.text('').previousTitleText(false);

  //$ionicConfigProvider.tabs.position('bottom'); //Places them at the bottom for all OS
  //$ionicConfigProvider.tabs.style('standard'); //Makes them all look the same across all OS
  //$ionicConfigProvider.backButton.previousTitleText(false).text('');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  var stateProvider = $stateProvider

  .state('app', {
    url:'/news',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.feed', {
    url: '/feed',
    //url:'/feed?search',
    //reloadOnSearch: false,
    views: {
      'menuContent' : {
        templateUrl: 'templates/feed.html',
        controller: 'FeedCtrl'
      }
    }
  })

  .state('app.article', {
    url: '/article/{id}',
    views: {
      'menuContent' : {
        templateUrl: 'templates/article.html',
        controller: 'ArticleCtrl'
      }
    }
  });

  if(window.cordova) {
    stateProvider.state('app.login', {
      url: '/login',
      views: {
        'menuContent' : {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.articlePost', {
      url: '/post/article',
      views: {
        'menuContent': {
          templateUrl: 'templates/articlePost.html',
          controller: 'PostCtrl'
        }
      }
    });
  }

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/news/feed');

});
