
'use strict';
var app = angular.module('instanews.service.dialog', ['ngMaterial', 'ngCordova']);

app.factory('Dialog', [
  '$cordovaDialogs',
  '$ionicActionSheet',
  '$mdDialog',
  '$mdToast',
  'Device',
  function(
    $cordovaDialogs,
    $ionicActionSheet,
    $mdDialog,
    $mdToast,
    Device
  ) {

    var showToast = function(message) {
      if(Device.isBrowser()) {
        $mdToast.show(
          $mdToast.simple()
          .textContent(message)
        ).then(function() {
        }, function() {
          console.log('Cancel');
        });
      } else {
        setTimeout( function() {
          window.plugins.toast.showShortCenter(message);
        }, 250);
      }
    };

    var showSheet = function(sheet) {
      $ionicActionSheet.show(sheet);
    };

    var showAlert = function (message, title, buttonName, cb) {
      if (!cb) {
        cb = buttonName;
        if (!cb) {
          buttonName = 'Ok';
          cb = title;
          if (!cb) {
            title = 'Alert';

            cb = function () {
              console.log('Dialog was confirmed');
            };
          } else if (typeof cb === 'function') {
            title = 'Alert';
          } else {
            cb = function () {};
          }
        } else if (typeof cb === 'function') {
          buttonName = 'Ok';
        } else {
          cb = function () {};
        }
      }

      if(Device.isBrowser()) {
        $mdDialog.show(
          $mdDialog.alert()
          .parent(angular.element(document.querySelector('#mainBody')))
          .clickOutsideToClose(true)
          .title(title)
          .textContent(message)
          .ariaLabel(title)
          .ok(buttonName)
        ).then(function() {
          cb();
        }, function() {
          console.log('Cancel');
        });
      } else {
        $cordovaDialogs.alert(message, title, buttonName)
        .then(cb);
      }
    };

    var showConfirm = function (message, title, buttonNames, cb) {
      if(!cb) {
        cb = buttonNames;
        if(!cb) {
          buttonNames = ['Ok', 'Cancel'];
          cb = title;
          if(!cb) {
            title = 'Confirm';

            cb = function () {
              console.log('Dialog was confirmed');
            };
          } else if (typeof cb === 'function') {
            title = 'Confirm';
          }
        } else if (typeof cb === 'function') {
          buttonNames = ['Ok', 'Cancel'];
        }
      }

      if(Device.isBrowser()) {
        $mdDialog.show(
          $mdDialog.confirm()
          .parent(angular.element(document.querySelector('#mainBody')))
          .clickOutsideToClose(true)
          .title(title)
          .textContent(message)
          .ariaLabel(title)
          .ok(buttonNames[0])
          .cancel(buttonNames[1])
        ).then(function() {
          cb();
        }, function() {
          console.log('Cancel');
        });
      } else {
        $cordovaDialogs.confirm(message, title, buttonNames)
        .then(cb);
      }
    };

    var showPrompt = function (message, title, buttonNames, defaultText,  cb) {
      if(!cb) {
        cb = defaultText;
        if(!cb) {
          defaultText = 'Type here';
          cb = buttonNames;
          if(!cb) {
            buttonNames = ['Ok', 'Cancel'];
            cb = title;
            if(!cb) {
              title = 'Confirm';

              cb = function () {
                console.log('Dialog was confirmed');
              };
            } else if (typeof cb === 'function') {
              title = 'Confirm';
            }
          } else if (typeof cb === 'function') {
            buttonNames = ['Ok', 'Cancel'];
          }
        } else if (typeof cb === 'function') {
          defaultText = 'Type here';
        }
      }

      if(Device.isBrowser()) {
        $mdDialog.show(
          $mdDialog.prompt()
          .parent(angular.element(document.querySelector('#mainBody')))
          .clickOutsideToClose(true)
          .title(title)
          .textContent(message)
          .ariaLabel(title)
          .ok(buttonNames[0])
          .cancel(buttonNames[1])
          .placeholder(defaultText)
        ).then(function(res) {
          cb(res);
        }, function() {
          console.log('Cancel');
        });
      } else {
        $cordovaDialogs.prompt(message, title, buttonNames, defaultText)
        .then(function(res) {
          if(res.buttonIndex === 1) {
            cb(res.input1);
          }
        });
      }
    };

    return {
      sheet: showSheet,
      alert: showAlert,
      confirm: showConfirm,
      prompt: showPrompt,
      toast: showToast
    };
  }
]);
