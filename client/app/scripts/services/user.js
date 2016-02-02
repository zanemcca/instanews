'use strict';

var app = angular.module('instanews.service.user', ['ionic', 'ngResource','ngCordova']);

/* jshint camelcase: false */
app.service('User', [
  'Installation',
  'Journalist',
  'LocalStorage',
  'LoopBackAuth',
  '$state',
  'Platform',
  function(
    Installation,
    Journalist,
    LocalStorage,
    LoopBackAuth,
    $state,
    Platform
  ){

    var user;

    var observers = [];

    var registerObserver = function(cb) {
      observers.push(cb);
    };

    var notifyObservers = function() {
      angular.forEach(observers, function(cb) {
        cb();
      });
    };

    var get = function() {
      return user;
    };

    var getToken = function() {
      if(user && user.id) {
        return user.id;
      }
    };

    var set = function(usr) {
      user = usr;

      notifyObservers();
      install();
    };

    var clearData = function() {
      set();
    };

    var install = function() {

      var device = Platform.getDevice();

      //TODO check if device is already installed
      if ( user &&
          user.userId &&
            device &&
              device.type &&
                device.token &&
                  device.token !== 'OK'
         ) {
           console.log('Attempting to install device on the server');

           var appConfig = {
             appId: 'instanews',
             userId: user.userId,
             deviceType: device.type,
             deviceToken: device.token,
             status: 'Active'
           };

           Installation.create(appConfig, function (result, header) {
             console.log('Created a new device installation : ' , header);
           },
           // istanbul ignore next
           function(err) {
             console.log('Error trying to install device', JSON.stringify(err));
           });
         }
    };

    //Load the login page
    var login = function() {
      //TODO Should probably use Navigate.go just in case
      //    It unfortunately adds a circular dependency
      $state.go('app.login');
    };

    //Logout
    var logout = function() {
      Journalist.logout()
      .$promise
      .then( function(res) {
        clearData();
        console.log('Logged out: ' + res);
      });
    };

    var isMine = function(item) {
      return (user && user.userId === item.username);
    };

    var isAdmin = function() {
      return (user && user.user && user.user.isAdmin);
    };

    var clearBadge = function () {
      if(user) {
        Journalist.clearBadge({
          id: user.userId
        }, function () {
          console.log('Successfully cleared the badge');
        }, function (err) {
          console.log('Failed to clear the badge');
          console.log(err);
        });
      }
    };

    // If a user is logged in already then request a new token
     // istanbul ignore else 
    if(LoopBackAuth.accessTokenId && LoopBackAuth.currentUserId) {
      //Request a new token that expires in 2 weeks
      //Journalist.accessTokens.create({
      Journalist.prototype$__create__accessTokens({
        id: LoopBackAuth.currentUserId,
        ttl: 1209600
      }, null, function(user) {
        Journalist.findById({
          id: LoopBackAuth.currentUserId
        }, function (usr) {
          user.user = usr;
          console.log('Refreshed user');
          console.log(user);
          set(user);
        }, function (err) {
          console.log(err);
        });
      }, 
      // istanbul ignore next
      function(err) {
        console.log('Error: Cannot create token for user: ' + err);
      });
    }

    var reload = function () {
      if(user) {
        Journalist.findById({
          id: user.userId 
        }, function (usr) {
          user.user = usr;
          set(user);
        }, function (err) {
          console.log(err);
         });
      }
    };

    Platform.ready
    .then(function () {
      document.addEventListener('resume', function () {
        console.log('Resuming app!');
        reload();
      }, false);

      if(!Platform.isBrowser()) {
        registerObserver(updateSupport);
        updateSupport();
      }
    });

    var updateSupport = function () {
      if(user && user.user) {
        Platform.support.setEmail(user.user.email);
        Platform.support.setName(user.userId);
      } else {
        Platform.support.clearUser();
      }
    };

    return {
      clearData: clearData,
      clearBadge: clearBadge,
      install: install,
      login: login,
      logout: logout,
      isMine: isMine,
      isAdmin: isAdmin,
      reload: reload,
      get: get,
      getToken: getToken,
      set: set,
      registerObserver: registerObserver
    };
  }]);
