
'use strict';
var app = angular.module('instanews.terms', []);

function TermsFactory($rootScope, $ionicModal, Term, User, Platform) {
  var terms = {};

  terms.terms = {
    modal: {},
    agreed: false,
    scope: {
      showAgree: false
    }
  };

  terms.policy = {
    modal: {},
    agreed: false,
    scope: {
      showAgree: false
    }
  };

  $rootScope.terms = terms.terms;
  $rootScope.policy = terms.policy;

  var initTerms = function(cb, fail) {
    Platform.ready.then(function () {
      if(terms.terms.text) {
        cb();
      } else {
        Term.terms().$promise.then(function(res) {
          terms.terms.version = res.terms.version;
          terms.terms.text = res.terms.text;
          cb();
        }, function(err) {
          console.log(err);
          fail();
        });
      }
    });
  };

  var initPolicy = function(cb, fail) {
    Platform.ready.then(function () {
      if(terms.policy.text) {
        cb();
      } else {
        Term.privacy().$promise.then(function(res) {
          terms.policy.version = res.policy.version;
          terms.policy.text = res.policy.text;
          cb();
        }, function(err) {
          console.log(err);
          fail();
        });
      }
    });
  };

  var ensureTerms = function (succ, fail, usr) {
    initTerms(function () {
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
      } else if(!user.user.termsVersion || user.user.termsVersion < terms.terms.version) {
        Platform.showConfirm('Our Terms of Use has changed. Do you accept the new terms?',
        'Terms of Use',
        ['Agree', 'Cancel', 'Show Me'],
        function(idx) {
          switch(idx) {
            case 1: //Agree
              agreeToTerms(user.user, succ, fail);
              break;
            case 3: //Show me
              Platform.loading.hide();
              terms.terms.scope.showAgree = true;
              terms.terms.scope.agree = agreeToTerms.bind(this, user.user, function() {
                terms.terms.agreed = true;
                terms.terms.modal.hide();
              }, function() {
                terms.terms.modal.hide();
              });

              terms.terms.modal.show();

              terms.terms.modal.hideCB = function() {
                if(terms.terms.agreed) {
                  terms.terms.scope.showAgree = false;
                  terms.terms.scope.agree = null;
                  terms.terms.agreed = false;
                  terms.terms.modal.hideCb = null;
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
    }, fail);
  };

  var ensurePolicy = function (succ, fail, usr) {
    initPolicy(function () {
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
      } else if(!user.user.policyVersion || user.user.policyVersion < terms.policy.version) {
        Platform.showConfirm('Our Privacy Policy has changed. Do you accept the new policy?',
        'Privacy Policy',
        ['Agree', 'Cancel', 'Show Me'],
        function(idx) {
          switch(idx) {
            case 1: //Agree
              agreeToPrivacy(user.user, succ, fail);
              break;
            case 3: //Show Me
              Platform.loading.hide();
              terms.policy.scope.showAgree = true;
              terms.policy.scope.agree = agreeToPrivacy.bind(this, user.user, function() {
                terms.policy.agreed = true;
                terms.policy.modal.hide();
              }, function() {
                terms.policy.modal.hide();
              });

              terms.policy.modal.show();

              terms.policy.modal.hideCB = function() {
                if(terms.policy.agreed) {
                  terms.policy.scope.showAgree = false;
                  terms.policy.scope.agree = null;
                  terms.policy.agreed = false;
                  terms.policy.modal.hideCb = null;
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
    }, fail);
  };

  var agreeToTerms = function(user, succ, fail) {
    fail = fail || function() {};
    succ = succ || function() {};

    User.agreeToTerms({
      id: user.username
    }, function() {
      Platform.loading.hide();
      user.termsVersion = terms.terms.version; 
      succ();
    }, function(err) {
      Platform.loading.hide();
      fail(err);
    });
  };

  var agreeToPrivacy = function(user, succ, fail) {
    fail = fail || function() {};
    succ = succ || function() {};

    User.agreeToPrivacy({
      id: user.username
    }, function() {
      Platform.loading.hide();
      user.policyVersion = terms.policy.version; 
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
    terms.terms.modal.show = modal.show.bind(modal);
    terms.terms.modal.hide = function() {
      console.log('Hiding modal');
      if(terms.terms.modal.hideCB) {
        terms.terms.modal.hideCB();
      }
      terms.terms.scope.showAgree = false;
      terms.terms.scope.agree = null;
      terms.terms.agreed = false;
      terms.terms.modal.hideCb = null;
      modal.hide();
    };
  });

  $ionicModal.fromTemplateUrl('templates/modals/policy.html', {
    scope: $rootScope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then( function (modal) {
    terms.policy.modal.show = modal.show.bind(modal);
    terms.policy.modal.hide = function() {
      console.log('Hiding modal');
      if(terms.policy.modal.hideCB) {
        terms.policy.modal.hideCB();
      }
      terms.policy.scope.showAgree = false;
      terms.policy.scope.agree = null;
      terms.policy.agreed = false;
      terms.policy.modal.hideCb = null;
      modal.hide();
    };
  });

  var ensure = function(succ, fail, usr) {
    ensureTerms(function() {
      ensurePolicy(succ, fail, usr);
    }, fail, usr);
  };

  initTerms(function () {}, function() {});
  initPolicy(function () {}, function() {});

  return {
    ensure: ensure,
    getPrivacyModal: function() {
      return terms.policy.modal;
    },
    getPrivacyVersion: function(cb) {
      initPolicy(function () {
        cb(terms.policy.version);
      }, function() {
        console.log('Failed to get policy!');
        cb();
      });
    },
    getPrivacy: function(cb) {
      initPolicy(function () {
        cb(terms.policy.text);
      }, function() {
        console.log('Failed to get policy!');
        cb();
      });
    },
    getTermsModal: function() {
      return terms.terms.modal;
    },
    getTermsVersion: function(cb) {
      initTerms(function () {
        cb(terms.terms.version);
      }, function() {
        console.log('Failed to get terms!');
        cb();
      });
    },
    getTerms: function(cb) {
      initTerms(function () {
        cb(terms.terms.text);
      }, function() {
        console.log('Failed to get terms!');
        cb();
      });
    }
  };
}

app.factory('Terms', [
  '$rootScope',
  '$ionicModal',
  'Term',
  'User',
  'Platform',
  TermsFactory
]);
