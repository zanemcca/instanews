var app = angular.module('instanews.votes', ['ionic', 'ngResource']);

app.directive('votes', [
      'Common',
      function (Common) {

   return {
      restrict: 'E',
      scope: {
         voteable: '='
      },
      controller: function($scope) {
         $scope.Common = Common;
      },
      templateUrl: 'templates/directives/votes.html'
   };
}]);
