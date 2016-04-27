
'use strict';
var app = angular.module('instanews.service.dialog', ['ngMaterial', 'ngCordova']);

app.factory('Dialog', [
  '$cordovaDialogs',
  '$ionicActionSheet',
  '$mdDialog',
  'Device',
  function(
    $cordovaDialogs,
    $ionicActionSheet,
    $mdDialog,
    Device
  ) {

    var showToast = function(message) {
      if(!Device.isBrowser()) {
        setTimeout( function() {
          window.plugins.toast.showShortCenter(message);
        }, 250);
      }
      console.log(message);
    };

    var showSheet = function(sheet) {
      $ionicActionSheet.show(sheet);
    };

    //TODO Use angular material or ionic for alerts
    var showAlert = function (message, title, buttonName, cb) {
      if(!cb) {
        cb = buttonName;
        if(!cb) {
          buttonName = 'Ok';
          cb = title;
          if(!cb) {
            title = 'Alert';

            cb = function () {
              console.log('Dialog was confirmed');
            };
          } else if (typeof cb === 'function') {
            title = 'Alert';
          }
        } else if (typeof cb === 'function') {
          buttonName = 'Ok';
        }
      }

      if(Device.isBrowser()) {
        $mdDialog.show(
          $mdDialog.alert()
          .parent(angular.element(document.querySelector('')))
          .clickOutsideToClose(true)
          .title(title)
          .textContent(message)
          .arialLabel(title)
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

      $cordovaDialogs.confirm(message, title, buttonNames)
      .then(cb);
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

      $cordovaDialogs.prompt(message, title, buttonNames, defaultText)
      .then(cb);
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
