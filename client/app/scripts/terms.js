
'use strict';
var app = angular.module('instanews.terms', []);

function TermsFactory() {
  var version = 0;
  var terms = 'Here are some terms and conditions.';

  return {
    getVersion: function() {
      return version;
    },
    getTerms: function() {
      return terms;
    }
  };
}

app.factory('Terms', [
  TermsFactory
]);
