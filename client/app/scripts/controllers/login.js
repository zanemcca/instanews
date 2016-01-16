
'use strict';
var app = angular.module('instanews.controller.login', ['ionic', 'ngResource', 'ngCordova']);

app.controller('LoginCtrl', [
  '$scope',
  '$state',
  '$ionicModal',
  'Navigate',
  'Platform',
  'User',
  'LocalStorage',
  'Journalist',
  function(
    $scope,
    $state,
    $ionicModal,
    Navigate,
    Platform,
    User,
    LocalStorage,
    Journalist) {

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
      };

      $scope.$watch('newUser', function(newVal, oldVal) {
        if (newVal.password !== oldVal.password) {
          $scope.passwordStrength = checkPasswordStrength(newVal.password);
        }
        if (newVal.username !== oldVal.username) {
          $scope.invalid.username = !validUsername(newVal.username);
        }
      }, true );

      $scope.login = function () {

        var successLogin = function(res) {
          User.set(res);

          /*
             if($scope.cred.remember) {

             var device = Platform.getDevice();
             if(res && device.type) {
             var session = {
user: res
}; 
LocalStorage.secureWrite('session', session);
}
else {
console.log('Error: Cannot save user!');
}
}
*/

          $scope.cred = {
username: '',
          password: '',
          email: '',
          remember: true
          };

          $scope.invalidLogin = false;

          if($scope.loginModal) {
            $scope.loginModal.hide();
          }
          Navigate.goOrGoBack();
        }; 

        var failedLogin = function (err) {
          /* istanbul ignore else */
          if(err) {
            console.log(err);
          }
          $scope.invalidLogin = true;
          $scope.cred.password = '';
        };

        var credentials;
        var query = {
          where: {}
        };

        if ( $scope.cred.username.indexOf('@') > -1 ) {
          credentials = {
            email: $scope.cred.username.toLowerCase(),
            password: $scope.cred.password,
          };
          query.where.email = credentials.email;
        } else {
          credentials = {
            username: $scope.cred.username.toLowerCase(),
            password: $scope.cred.password,
          };
          query.where.username = credentials.username;
        }

        Journalist.findOne({ filter: query}, function (res) {
          if(!res.emailVerified) {
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
          Platform.showToast('There is no user with the given username');
        });
      }; 

      $scope.verify = function () {
        Journalist.confirm({
          uid: $scope.cred.username.toLowerCase(),
          token: $scope.verify.token
        }, function () {
          $scope.login();
          $scope.verifyModal.hide();
        }, function (err) {
          console.log(err);
          $scope.invalid.token = true;
          Platform.showToast('The token you entered is invalid. Please try again');
        });
      };

      $scope.verifyLater = function () {
        $scope.verifyModal.hide();
        if( $scope.loginModal) {
          $scope.loginModal.hide();
        }
        Navigate.goOrGoBack();
      };

      $scope.resendConfirmation = function () {
        var usr = {};
        if($scope.cred.username) {
          usr.username = $scope.cred.username;
        } else if($scope.cred.email) {
          usr.email = $scope.cred.email;
        } else {
          console.log('Failed to send the confirmation code');
          return;
        }
        Journalist.resendConfirmation({
          user: usr
        }, function () {
          Platform.showToast('We sent you a new confirmation code. It should arrive soon');
        }, function (err) {
          console.log(err);
          Platform.showToast('Failed to send the confirmation code. Please try again');
        });
      };

      $scope.requestPasswordReset = function () {
        var usr = {};

        if($scope.cred.username) {
          $scope.cred.username = $scope.cred.username.toLowerCase();
          if($scope.cred.username.indexOf('@') > -1) {
            usr.email = $scope.cred.username;
          } else {
            usr.username = $scope.cred.username;
          }
        } else {
          Platform.showToast('A username or an email are required to reset a password');
          return;
        }

        Journalist.requestPasswordReset({
          user: usr
        }, function () {
          Platform.showToast('We sent you a reset code. It should arrive soon');
          $scope.reset.forgotModal.hide();
          $scope.reset.Modal.show();
        }, function (err) {
          console.log(err);
          Platform.showToast('Failed to send the reset code. Please try again');
        });
      };

      $scope.resetPassword = function () {
        var usr = {};
        if($scope.cred.username) {
          $scope.cred.username = $scope.cred.username.toLowerCase();
          if($scope.cred.username.indexOf('@') > -1) {
            usr.email = $scope.cred.username;
          } else {
            usr.username = $scope.cred.username;
          }
        } else {
          Platform.showToast('A username or an email are required to reset a password');
          return;
        }

        if(!$scope.reset.token || $scope.reset.token.length !== 6) {
          Platform.showToast('The token given is invalid');
        } else if(checkPasswordStrength($scope.reset.password) <= 0) {
          Platform.showToast('The password given is too weak');
        } else if ($scope.reset.password !== $scope.reset.confirmPassword) {
          Platform.showToast('The confirmation password does not match the original');
        } else {
          usr.password = $scope.reset.password;
          usr.token = $scope.reset.token;
          if(typeof(usr.token) === 'number') {
            usr.token = usr.token.toString();
          }
          Journalist.passwordReset({ user: usr}, function () {
            $scope.cred.password = usr.password;
            $scope.login();
            $scope.reset.Modal.hide();
          }, function (err) {
            console.log(err);
            Platform.showToast('There was an error resetting your password. Please try again');
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
        var user = {
          email: $scope.newUser.email,
          lastUpdated: Date.now(),
          password: $scope.newUser.password
        };

        if( $scope.passwordStrength <= 0) {
          Platform.showToast('The password you entered is too weak!');
        } else if(!$scope.validEmail()) {
          Platform.showToast('The email you entered is not properly formatted!');
          $scope.invalid.email = true;
        } else {
          //Verify that the email and username is unique
          Journalist.count({
            where: {
              email: user.email
            }
          }, function(res) {
            if( res.count > 0) {
              $scope.invalid.email = true;
              Platform.showToast('The email you entered is already used!');
            }
            else {
              /* istanbul ignore else */
              if ( $scope.newUser.username ) {
                user.username = $scope.newUser.username.toLowerCase();
              } else {
                Platform.showToast('You must enter a username!');
                $scope.invalid.username = true;
                return;
              }

              Journalist.count({
                where: {
                  username: user.username
                }
              }, function(res) {
                if( res.count > 0) {
                  $scope.invalid.username = true;
                  Platform.showToast('The username you entered is already used. Please try again');
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
                    $scope.login();
                    $scope.trashNewUser();
                  }, 
                  /* istanbul ignore next */
                  function(err) {
                    console.log(err);
                  });
                }
              },
              /* istanbul ignore next */
              function(err) {
                console.log(err);
              });
            }
          },
          /* istanbul ignore next */
          function(err) {
            console.log(err);
          });
        }
      };
    }
]);
