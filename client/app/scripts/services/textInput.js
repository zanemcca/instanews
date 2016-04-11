
'use strict';

var app = angular.module('instanews.service.textInput', ['ionic', 'ngResource']);

app.factory('TextInput', [
  '$ionicModal',
  '$timeout',
  '$rootScope',
  'Navigate',
  'Platform',
  function(
    $ionicModal,
    $timeout,
    $rootScope,
    Navigate,
    Platform
  ) {
    var current;
    var modal = {
      text: '',
      placeholder: 'What\'s the story?',
      maxLength: 50000,
      open: function (done, interrupted) {
        if(modal.modal) {
          console.log('WARNING: The textinput modal should be destroyed and recreated after each use to ensure it stays ontop');
          modal.modal.remove();
        }

        initModal(function() {
          modal.modal.show();

          modal.saveText = function () {
            unregister();
            done(modal.text);
            modal.text = '';
            modal.placeholder = 'What\'s the story?';
            modal.maxLength = 50000;
            modal.modal.hide();
            modal.modal.remove();
            modal.modal = null;
          };

          var unregister = $rootScope.$on('modal.hidden', function() {
            Platform.keyboard.hide();
            unregister();
            interrupted(modal.text);
            modal.modal.remove();
            modal.modal = null;
          });

          $timeout(Platform.keyboard.show, 16);
          $timeout(function () {
            Navigate.focus('text-input-modal');
          }, 16);
        });
      }
    };

    var count = 0;

    var initModal = function (cb) {
      $ionicModal.fromTemplateUrl('templates/modals/textInput.html', {
        scope: $rootScope,
        focusFirstInput: true,
        animation: 'slide-in-up'
      }).then( function (textModal) {
        modal.modal = textModal;
        $rootScope.textInput = modal;
        cb();
      });
    };

    var register = function (input) {
      current = input;
      if(!current.id) {
        count++;
        current.id = 'text-input-' + count;
        current.boxId = 'text-box-' + count;
      }
    };

    var get = function (type) {
      type = type || 'footer';
      if(type === 'footer') {
        return current;
      } else if(type === 'modal') {
        return modal;
      } else {
        console.log('Unknown type: ' + type);
      }
    };

    return {
      register: register,
      get: get
    };
  }]);
