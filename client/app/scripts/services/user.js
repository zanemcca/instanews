'use strict';

var app = angular.module('instanews.service.user', ['ionic', 'ngResource','ngCordova']);

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
      if(!Platform.isBrowser()) {
        LocalStorage.secureDelete('session');
      }
    };

    var install = function() {

      var device = Platform.getDevice();

      //TODO check if device is already installed
      if ( user &&
          user.username &&
            device &&
              device.type &&
                device.token &&
                  device.token !== 'OK'
         ) {
           console.log('Attempting to install device on the server');

           var appConfig = {
             appId: 'instanews',
             userId: user.username,
             deviceType: device.type,
             deviceToken: device.token,
             status: 'Active'
           };

           Installation.create(appConfig, function (result, header) {
             console.log('Created a new device installation : ' , header);
           }, function(err) {
             console.log('Error trying to install device', JSON.stringify(err));
           });
         }
    };

    //Load the login page
    var login = function() {
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

    // If a user is logged in already then request a new token
    if(LoopBackAuth.accessTokenId && LoopBackAuth.currentUserId) {
      //Request a new token that expires in 2 weeks
      //Journalist.accessTokens.create({
      Journalist.prototype$__create__accessTokens({
        id: LoopBackAuth.currentUserId,
        ttl: 1209600
      }, null, function(user) {
        set(user);
      }, function(err) {
        console.log('Error: Cannot create token for user: ' + err);
      });
    }

    return {
      clearData: clearData,
      install: install,
      login: login,
      logout: logout,
      get: get,
      getToken: getToken,
      set: set,
      registerObserver: registerObserver
    };
  }]);
