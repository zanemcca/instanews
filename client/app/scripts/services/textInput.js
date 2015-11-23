
'use strict';

var app = angular.module('instanews.service.textInput', ['ionic', 'ngResource']);

app.factory('TextInput', [
  function(
  ) {
    var current;

    var register = function (input) {
      current = input;
    };

    var get = function () {
      return current;
    };

    return {
      register: register,
      get: get
    };
  }]);
