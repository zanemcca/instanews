'use strict';

var app = angular.module('instanews.service.user', ['ionic', 'ngResource','ngCordova']);

app.service('User', [
  'Installation',
  'LocalStorage',
  'Platform',
  function(
    Installation,
    LocalStorage,
    Platform
  ){

  var user = {};

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
    if( user && user.user) {
      return user.user;
    }
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
    set({});
    if(!Platform.isBrowser()) {
      LocalStorage.secureDelete(Platform.getUUID());
    }
  };

  var install = function() {

    var device = Platform.getDevice();

    //TODO check if device is already installed
    if ( user &&
      user.user &&
      user.user.username &&
      device &&
      device.type &&
      device.token &&
      device.token !== 'OK'
    ) {
      console.log('Attempting to install device on the server');

      var appConfig = {
        appId: 'instanews',
        userId: user.user.username,
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

  return {
    clearData: clearData,
    install: install,
    get: get,
    getToken: getToken,
    set: set,
    registerObserver: registerObserver
  };
}]);
