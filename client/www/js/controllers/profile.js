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

   var filter = {
      limit: 50,
      skip: 0,
      include: {
         relation: 'subarticles',
         scope: {
            where: {
               username: ''
            },
            order: 'rating DESC'
         }
      },
      order: 'lastUpdated DESC'
   };

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.beforeEnter', function() {

      var user = Common.getUser();

      if( user && $stateParams.username === user.username) {
         $scope.user = user;
         $scope.me = true;
      }
      else {
         $scope.me = false;
         Journalist.findById({id: $stateParams.username})
         .$promise
         .then( function(user) {
            $scope.user = user;
            console.log('Retrieved user: ', $scope.user.username);
         });
      }

      filter.include.scope.where.username = $stateParams.username;

      Journalist.articles({id: $stateParams.username, filter: filter})
      .$promise
      .then( function(res) {
         $scope.articles = res;
      }, function(err) {
         console.log('Error: ' + err.data.error.stack);
      });
   });
}]);
