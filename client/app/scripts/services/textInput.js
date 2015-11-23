
'use strict';

var app = angular.module('instanews.service.textInput', ['ionic', 'ngResource']);

app.factory('TextInput', [
  function(
  ) {
    var current;
    var count = 0;

    var register = function (input) {
      current = input;
      if(!current.id) {
        count++;
        current.id = 'text-input-' + count;
        current.boxId = 'text-box-' + count;
      }
    };

    var get = function () {
      return current;
    };

    return {
      register: register,
      get: get
    };
  }]);
