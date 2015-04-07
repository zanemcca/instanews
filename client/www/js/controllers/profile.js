var app = angular.module('instanews.profile', ['ionic', 'ngResource']);

app.controller('ProfileCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Journalist',
      'Common',
      function($scope,
         $stateParams,
         Article,
         Journalist,
         Common) {

   $scope.user = {};
   $scope.me = false;
   $scope.toggleMenu = Common.toggleMenu;

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.beforeEnter', function() {

      var user = Common.getUser();

      if( user && $stateParams.username === user.username) {
         $scope.user = user;
         $scope.me = true;
      }
      else {
         Journalist.findById({id: $stateParams.username})
         .$promise
         .then( function(user) {
            $scope.user = user;
            console.log('Retrieved user: ', $scope.user.username);
         });
         $scope.me = false;
      }
   });
}]);
