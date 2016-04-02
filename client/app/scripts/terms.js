
'use strict';
var app = angular.module('instanews.terms', []);

function TermsFactory($rootScope, $ionicModal, User, Platform) {
  var terms = {};
  $rootScope.terms = terms;
  terms.modal = {};
  terms.scope = {
    showAgree: false
  };

  terms.agreed = false;

  terms.version = 1;
  terms.text = 'Here are some terms and conditions.';

  var ensureTerms = function (succ, fail, usr) {
    var user;
    if(usr) {
      user = {
        user: usr
      };
    } else {
      user = User.get();
    }

    if(!user || !user.user) {
      fail();
    } else if(!user.user.termsVersion || user.user.termsVersion < terms.version) {
      Platform.showConfirm('Our Terms and Conditions have changed. Do you accept the new terms?',
      'Terms and Conditions',
      ['Agree', 'Cancel', 'Show Me'],
      function(idx) {
        switch(idx) {
          case 1: //Agree
            agree(user.user, succ, fail);
            break;
          case 3: //Show Me
            Platform.loading.hide();
            terms.scope.showAgree = true;
            terms.scope.agree = agree.bind(this, user.user, function() {
              terms.agreed = true;
              terms.modal.hide();
            }, function() {
              terms.modal.hide();
            });

            terms.modal.show();

            terms.modal.hideCB = function() {
              if(terms.agreed) {
                terms.scope.showAgree = false;
                terms.scope.agree = null;
                terms.agreed = false;
                terms.modal.hideCb = null;
                succ();
              } else {
                fail();
              }
            };
            break;
          default:
            fail();
            break;
        }
      });
    } else {
      succ();
    }
  };

  var agree = function(user, succ, fail) {
    fail = fail || function() {};
    succ = succ || function() {};

    User.agreeToTerms({
      id: user.username,
      version: terms.version
    }, function() {
      Platform.loading.hide();
      user.termsVersion = terms.version; 
      succ();
    }, function(err) {
      Platform.loading.hide();
      fail(err);
    });
  };

  $ionicModal.fromTemplateUrl('templates/modals/terms.html', {
    scope: $rootScope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then( function (modal) {
    terms.modal.show = modal.show.bind(modal);
    terms.modal.hide = function() {
      console.log('Hiding modal');
      if(terms.modal.hideCB) {
        terms.modal.hideCB();
      }
      terms.scope.showAgree = false;
      terms.scope.agree = null;
      terms.agreed = false;
      terms.modal.hideCb = null;
      modal.hide();
    };
  });

  return {
    modal: terms.modal,
    ensure: ensureTerms,
    getVersion: function() {
      return terms.version;
    },
    getTerms: function() {
      return terms.text;
    }
  };
}

app.factory('Terms', [
  '$rootScope',
  '$ionicModal',
  'User',
  'Platform',
  TermsFactory
]);
