var app = angular.module('instanews.login', ['ionic', 'ngResource']);

app.controller('LoginCtrl', [
      '$scope',
      '$state',
      '$ionicModal',
      'Common',
      'Journalist',
      function($scope,
         $state,
         $ionicModal,
         Common,
         Journalist) {

   $scope.cred = {
      username: '',
      password: '',
      rememberMe: true
   }

   $scope.invalidLogin = false;

   $scope.newUser = {
      first: '',
      last: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
   }

   $ionicModal.fromTemplateUrl('templates/signupModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.signupModal = modal;
   });


   $scope.skip = function () {
      $scope.cred.username = 'zane';
      $scope.cred.password = 'password';
      $scope.login();
   }

   $scope.login = function () {

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
         include: 'user',
         rememberMe: $scope.cred.remember
      }, credentials)
      .$promise
      .then( function(res) {
            Common.user = res;

            //TODO Persist saved credentials
            if ($scope.cred.rememberMe) {

            }

            $scope.cred = {
               username: '',
               password: ''
            }

            $scope.invalidLogin = false;
            $state.go('feed');
      }, function (err) {
         $scope.invalidLogin = true;
         $scope.cred.password = '';
      });
   };

   $scope.trashNewUser = function () {
      $scope.newUser = {
         first: '',
         last: '',
         username: '',
         email: '',
         password: '',
         confirmPassword: ''
      }
      $scope.signupModal.hide();
   };

   $scope.signup = function () {
      var user = {
         firstName: $scope.newUser.first,
         lastName: $scope.newUser.last,
         email: $scope.newUser.email,
         lastUpdated: Date.now(),
         password: $scope.newUser.password
      };

      if ( $scope.newUser.username ) {
         user.username = $scope.newUser.username.toLowerCase();
      }

      console.log('User: ', user);
      Journalist.create(user, function (res) {
         console.log(res);
         console.log('Signed up');
         $scope.trashNewUser();
      });
   };

}]);
