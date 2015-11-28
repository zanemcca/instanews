
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
      function($scope,
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

   $scope.invalid = {
   };

   $scope.invalidLogin = false;
   $scope.credUsed = false;

   $scope.newUser = {
      username: '',
      email: '',
      remember: true,
      password: ''
   };

   $ionicModal.fromTemplateUrl('templates/loginModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.loginModal = modal;
   });

   //TODO Remove
   $scope.skip = function () {
      $scope.cred.username = 'zane';
      $scope.cred.password = 'password';
      $scope.login();
   };

   $scope.validEmail = function() { 
     var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
     var valid = re.test($scope.newUser.email);
     if(valid) {
       $scope.invalid.email = false;
     }
     return valid;
    };

    $scope.passwordStrength = 0;

    $scope.$watch('newUser', function(newVal, oldVal) {
      if (newVal.password !== oldVal.password) {
        var p = newVal.password;
        var strength = 0;

        /* istanbul ignore if */
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

        $scope.passwordStrength = strength;
      }

      $scope.credUsed = false;
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

      if ( $scope.cred.username.indexOf('@') > -1 ) {
         credentials = {
            email: $scope.cred.username.toLowerCase(),
            password: $scope.cred.password,
         };
      }
      else {
         credentials = {
            username: $scope.cred.username.toLowerCase(),
            password: $scope.cred.password,
         };
      }

      Journalist.login({
       //  include: 'user',
         rememberMe: $scope.cred.remember
      }, credentials,
      successLogin,
      failedLogin);
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

}]);
