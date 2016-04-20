
'use strict';
var app = angular.module('instanews.controller.login', ['ionic', 'ngResource', 'ngCordova']);

app.controller('LoginCtrl', [
  '$scope',
  '$state',
  '$ionicModal',
  'Navigate',
  'Platform',
  'Terms',
  'User',
  'LocalStorage',
  'Journalist',
  function(
    $scope,
    $state,
    $ionicModal,
    Navigate,
    Platform,
    Terms,
    User,
    LocalStorage,
    Journalist) {

//      $scope.terms = Terms.getTerms();
      $scope.Terms = Terms;

      $scope.cred = {
        username: '',
        password: '',
        remember: true
      };

      $scope.verify = {
        token: null
      };

      $scope.reset = {
        token: null
      };

      $scope.invalid = {
      };

      $scope.invalidLogin = false;

      $scope.$on('$ionicView.afterEnter', function() {
        Platform.analytics.trackView('Login View');
      });

      $scope.newUser = {
        username: '',
        email: '',
        remember: true,
        password: ''
      };

      $ionicModal.fromTemplateUrl('templates/modals/loginModal.html', {
        scope: $scope,
        backdropClickToClose: false,
        focusFirstInput: true,
        animation: 'slide-in-up'
      }).then( function (modal) {
        $scope.loginModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/modals/verifyModal.html', {
        scope: $scope,
        backdropClickToClose: false,
        focusFirstInput: true,
        animation: 'slide-in-up'
      }).then( function (modal) {
        $scope.verifyModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/modals/resetPasswordModal.html', {
        scope: $scope,
        backdropClickToClose: false,
        focusFirstInput: true,
        animation: 'slide-in-up'
      }).then( function (modal) {
        $scope.reset.Modal = modal;
        $scope.$watch('reset.password', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.passwordStrength = checkPasswordStrength(newVal);
          } 
        }, true );
      });

      $ionicModal.fromTemplateUrl('templates/modals/forgotPassword.html', {
        scope: $scope,
        backdropClickToClose: false,
        focusFirstInput: true,
        animation: 'slide-in-up'
      }).then( function (modal) {
        $scope.reset.forgotModal = modal;
      });

      // Cleanup modals
      $scope.$on('$destroy', function () {
        $scope.reset.forgotModal.remove();
        $scope.reset.Modal.remove();
        $scope.verifyModal.remove();
        $scope.loginModal.remove();
      });

      $scope.validEmail = function() { 
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        var valid = re.test($scope.newUser.email);
        if(valid) {
          $scope.invalid.email = false;
        }
        return valid;
      };

      $scope.passwordStrength = 0;

      var checkPasswordStrength = function (password) {
        var p = password;
        var strength = 0;

        // istanbul ignore if
        if( !p || p.length === 0 ) {
          strength = 0;
        }
        else if (p.length < 8) {
          strength = -1;
        }
        else {
          //lowercase && (numbers || uppercase || special)
          var strong = /^(?=.*[a-z])((?=.*[A-Z])|(?=.*\d)|(?=.*[-+_!@#$%^&*.,?~])).+$/;
          //lowercase && 2 of (numbers || uppercase || special)
          var excellent = /^(?=.*[a-z])(((?=.*[A-Z])(?=.*\d))|((?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?~]))|((?=.*\d)(?=.*[-+_!@#$%^&*.,?]))).+$/;
          if (excellent.test(p) || (p.length >= 12 && strong.test(p))) {
            strength = 3;
          }
          else if (strong.test(p) || p.length >= 12) {
            strength = 2;
          }
          else {
            strength = 1;
          }
        }

        return strength;
      };

      function validUsername(username) {
        var valid =  /^[A-Za-z0-9_-]{3,16}$/;
        return valid.test(username);
      }

      $scope.$watch('newUser', function(newVal, oldVal) {
        if (newVal.password !== oldVal.password) {
          $scope.passwordStrength = checkPasswordStrength(newVal.password);
        }
        if (newVal.username !== oldVal.username) {
          $scope.invalid.username = !validUsername(newVal.username);
        }
      }, true );

      $scope.login = function () {
        Platform.analytics.trackEvent('Login', 'start');
        Platform.loading.show();

        var successLogin = function(res) {
          //Journalist.findOne only returns user information if it is that user requesting it. 
          //Therefore the first findOne does not get the user and this one is required
          Journalist.findOne({ filter: query}, function (user) {
            res.user = user;

            $scope.invalidLogin = false;

            var succ = function() {
              User.set(res);

              $scope.cred = {
                username: '',
                password: '',
                email: '',
                remember: true
              };

              if($scope.loginModal) {
                $scope.loginModal.hide();
              }

              Platform.loading.hide();
              Navigate.goOrGoBack();
              Platform.analytics.trackEvent('Login', 'success');
            };

            Terms.ensure(function () {
              succ();
            }, function(err) {
              console.log('Terms & Conditions are out of date. Cannot login!');
              console.log(err);
              Journalist.logout(function() {
                Platform.loading.hide();
              }, function(err) {
                console.log(err);
                Platform.loading.hide();
              });
            }, user);
          }, function (err) {
            Platform.loading.hide();
            Platform.analytics.trackEvent('Login', 'error', 'status', err.status);
            Platform.showAlert('There was an unknown error while logging in', 'Please try again');
            console.log(err);
          });
        }; 

        var failedLogin = function (err) {
          /* istanbul ignore else */
          $scope.invalidLogin = true;
          $scope.cred.password = '';

          Platform.analytics.trackEvent('Login', 'error', 'status', err.status);
          Platform.loading.hide();
          if(err) {
            console.log(err);
            if(err.data && err.data.error && err.data.error.status === 401) {
              Platform.showAlert('Please try again!', 'Invalid credentials');
            } else {
              Platform.showAlert('There was an unknown error while logging in', 'Please try again');
            }
          } else {
            Platform.showAlert('There was an unknown error while logging in', 'Please try again');
          }
        };

        var credentials;
        var query = {
          where: {}
        };

        if ( $scope.cred.username.indexOf('@') > -1 ) {
          credentials = {
            ttl: 6*7*24*60*60, 
            email: $scope.cred.username.toLowerCase(),
            password: $scope.cred.password,
          };
          query.where.email = credentials.email;
        } else {
          credentials = {
            ttl: 6*7*24*60*60, 
            username: $scope.cred.username.toLowerCase(),
            password: $scope.cred.password,
          };
          query.where.username = credentials.username;
        }

        Journalist.findOne({ filter: query}, function (res) {
          if(!res.emailVerified) {
            Platform.loading.hide();
            $scope.verifyModal.show();
          } else { 
            Journalist.login({
              //  include: 'user',
              rememberMe: $scope.cred.remember
            }, credentials,
            successLogin,
            failedLogin);
          }
        }, function (err) {
          console.log(err);
          Platform.loading.hide();
          Platform.analytics.trackEvent('Login', 'error', 'status', err.status);
          Platform.showAlert('There is no user with the given username or email' , 'Invalid Username');
        });
      }; 

      $scope.verify = function () {
        Platform.analytics.trackEvent('Verify', 'start');
        Platform.loading.show();
        Journalist.confirm({
          uid: $scope.cred.username.toLowerCase(),
          token: $scope.verify.token
        }, function () {
          $scope.login();
          $scope.verifyModal.hide();
          Platform.analytics.trackEvent('Verify', 'success');
        }, function (err) {
          console.log(err);
          $scope.invalid.token = true;
          Platform.loading.hide();
          Platform.analytics.trackEvent('Verify', 'error', 'status', err.status);
          Platform.showAlert('The token you entered is invalid. Please try again', 'Invalid Token');
        });
      };

      $scope.verifyLater = function () {
        $scope.verifyModal.hide();
        if( $scope.loginModal) {
          $scope.loginModal.hide();
        }
        Platform.analytics.trackEvent('Verify', 'verifyLater');
        Navigate.goOrGoBack();
      };

      $scope.resendConfirmation = function () {
        var usr = {};
        if($scope.cred.username) {
          if($scope.cred.username.indexOf('@') > -1) {
            usr.email = $scope.cred.username;
          } else {
            usr.username = $scope.cred.username;
          }
        } else if($scope.cred.email) {
          usr.email = $scope.cred.email;
        } else {
          console.log('Failed to send the confirmation code');
          return;
        }
        Platform.loading.show();
        console.log(usr);
        Journalist.resendConfirmation({
          user: usr
        }, function () {
          Platform.loading.hide();
          Platform.showToast('We sent you a new confirmation code. It should arrive soon');
        }, function (err) {
          console.log(err);
          Platform.loading.hide();
          Platform.showAlert('Failed to send the confirmation code. Please try again');
        });
      };

      $scope.requestPasswordReset = function () {
        Platform.analytics.trackEvent('ResetPassword', 'start');
        var usr = {};

        if($scope.cred.username) {
          $scope.cred.username = $scope.cred.username.toLowerCase();
          if($scope.cred.username.indexOf('@') > -1) {
            usr.email = $scope.cred.username;
          } else {
            usr.username = $scope.cred.username;
          }
        } else {
          Platform.analytics.trackEvent('ResetPassword', 'badCredentials');
          Platform.showAlert('A username or an email are required to reset a password', 'Invalid Credentials');
          return;
        }

        Platform.loading.show();
        Journalist.requestPasswordReset({
          user: usr
        }, function () {
          Platform.loading.hide();
          Platform.showToast('We sent you a reset code. It should arrive soon');
          $scope.reset.forgotModal.hide();
          $scope.reset.Modal.show();
        }, function (err) {
          console.log(err);
          Platform.loading.hide();
          Platform.analytics.trackEvent('ResetPassword', 'error', 'status', err.status);
          Platform.showAlert('Failed to send the reset code. Please try again');
        });
      };

      $scope.resetPassword = function () {
        Platform.analytics.trackEvent('ResetPassword', 'sendReset');
        var usr = {};
        if($scope.cred.username) {
          $scope.cred.username = $scope.cred.username.toLowerCase();
          if($scope.cred.username.indexOf('@') > -1) {
            usr.email = $scope.cred.username;
          } else {
            usr.username = $scope.cred.username;
          }
        } else {
          Platform.analytics.trackEvent('ResetPassword', 'usernameOrEmailNeeded');
          Platform.showAlert('A username or an email are required to reset a password', 'Invalid Credentials');
          return;
        }

        if(!$scope.reset.token || $scope.reset.token.length !== 6) {
          Platform.analytics.trackEvent('ResetPassword', 'invalidToken');
          Platform.showAlert('The token given is invalid', 'Invalid Token');
        } else if(checkPasswordStrength($scope.reset.password) <= 0) {
          Platform.analytics.trackEvent('ResetPassword', 'weakPassword');
          Platform.showAlert('You must have at least 8 characters', 'Password to weak');
        } else if ($scope.reset.password !== $scope.reset.confirmPassword) {
          Platform.analytics.trackEvent('ResetPassword', 'passwordMismatch');
          Platform.showAlert('The confirmation password does not match the original', 'Password Mismatch');
        } else {
          usr.password = $scope.reset.password;
          usr.token = $scope.reset.token;
          if(typeof(usr.token) === 'number') {
            usr.token = usr.token.toString();
          }
          if(typeof(usr.password) === 'number') {
            usr.password = usr.password.toString();
          }

          Platform.loading.show();
          Journalist.passwordReset({ user: usr}, function () {
            $scope.cred.password = usr.password;
            Platform.analytics.trackEvent('ResetPassword', 'success');
            $scope.login();
            $scope.reset.Modal.hide();
            Platform.loading.hide();
          }, function (err) {
            console.log(err);
            Platform.loading.hide();
            Platform.analytics.trackEvent('ResetPassword', 'error', 'status', err.status);
            Platform.showAlert('There was an error resetting your password. Please try again');
          });
        }
      };

      $scope.trashNewUser = function () {
        $scope.newUser = {
          username: '',
          email: '',
          remember: true,
          password: ''
        }; 
        //$scope.loginModal.hide();
      };

      $scope.signup = function () {
        Platform.analytics.trackEvent('Signup', 'start');
        Terms.getTermsVersion(function(termsVersion) {
          Terms.getPrivacyVersion(function(policyVersion) {
            var user = {
              email: $scope.newUser.email,
              lastUpdated: Date.now(),
              termsVersion: termsVersion,
              policyVersion: policyVersion,
              password: $scope.newUser.password
            };

            if( !termsVersion || !policyVersion) {
              Platform.analytics.trackEvent('Signup', 'badTerms');
              Platform.showAlert('There was an unknown error while signing up', 'Please try again');
            } else if( $scope.passwordStrength <= 0) {
              Platform.analytics.trackEvent('Signup', 'weakPassword');
              Platform.showAlert('You must have at least 8 characters', 'Password to weak');
            } else if(!$scope.validEmail()) {
              $scope.invalid.email = true;
              Platform.analytics.trackEvent('Signup', 'badEmail');
              Platform.showAlert('The email you entered is not properly formatted!', 'Invalid Email');
            } else {
              Platform.loading.show();
              //Verify that the email and username is unique
              Journalist.count({
                where: {
                  email: user.email
                }
              }, function(res) {
                if( res.count > 0) {
                  Platform.loading.hide();
                  $scope.invalid.email = true;
                  Platform.analytics.trackEvent('Signup', 'emailAlreadyUsed');
                  Platform.showAlert('The email you entered is already used!', 'Email Used');
                } else {
                  /* istanbul ignore else */
                  if ( $scope.newUser.username ) {
                    user.username = $scope.newUser.username.toLowerCase();
                  } else {
                    Platform.loading.hide();
                    Platform.analytics.trackEvent('Signup', 'usernameRequired');
                    Platform.showAlert('You must enter a username!', 'Invalid Username');
                    $scope.invalid.username = true;
                    return;
                  }

                  Journalist.count({
                    where: {
                      username: user.username
                    }
                  }, function(res) {
                    if( res.count > 0) {
                      Platform.loading.hide();
                      $scope.invalid.username = true;
                      Platform.analytics.trackEvent('Signup', 'usernameAlreadyUsed');
                      Platform.showAlert('The username you entered is already used. Please try another one', 'Username Taken');
                    }
                    else {
                      Journalist.create(user, function (res) {
                        console.log(res);
                        console.log('Signed up');
                        $scope.cred = {
                          username: user.username,
                          password: user.password,
                          remember: $scope.newUser.remember
                        };
                        Platform.analytics.trackEvent('Signup', 'success');
                        $scope.login();
                        $scope.trashNewUser();
                      }, 
                      /* istanbul ignore next */
                      function(err) {
                        console.log(err);
                        Platform.loading.hide();
                        Platform.analytics.trackEvent('Signup', 'error', 'status', err.status);
                        if([403, 422].indexOf(err.status) > -1) {
                          Platform.showAlert((err.data && err.data.message) || 'There was an error with your credentials', 'Please try again');
                        } else {
                          Platform.showAlert('There was an unknown error while signing up', 'Please try again');
                        }
                      });
                    }
                  },
                  /* istanbul ignore next */
                  function(err) {
                    Platform.loading.hide();
                    Platform.analytics.trackEvent('Signup', 'error', 'status', err.status);
                    Platform.showAlert('There was an unknown error while signing up', 'Please try again');
                    console.log(err);
                  });
                }
              },
              /* istanbul ignore next */
              function(err) {
                Platform.loading.hide();
                Platform.analytics.trackEvent('Signup', 'error', 'status', err.status);
                Platform.showAlert('There was an unknown error while signing up', 'Please try again');
                console.log(err);
              });
            }
          });
        });
      };
    }
]);
