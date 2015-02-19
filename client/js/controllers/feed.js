
angular
.module('app')
.controller('FeedCtrl', ['$scope', '$state', 'Article', function($scope, $state, Article) {
   $scope.articles = [];

   function getArticles() {
      Article.find().$promise.then( function (res) {
         $scope.articles = res;
      });
   }

   getArticles();

}]);
