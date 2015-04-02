var app = angular.module('instanews.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
      'Common',
      function (Common) {

   return {
      restrict: 'E',
      scope: {
         owner: '='
      },
      controller: function($scope) {
         $scope.Common = Common;
      },
      templateUrl: 'templates/directives/comments.html'
   };
}]);
