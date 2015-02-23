
var cb = function(err, res) {
   if (err) {
      console.log(err);
   }
   console.log(res);
};

angular
.module('starter')
.controller('FeedCtrl', ['$scope', '$state', 'Article', function($scope, $state, Article) {
   $scope.articles = [];

   function getArticles() {
      Article.find()
      .$promise
      .then( function (res) {
         $scope.articles = res;
      });
   }

   getArticles();

   $scope.upvote = function(article) {
      Article.prototype$upvote({id: article.articleId});
   }

   $scope.downvote = function(article) {
      Article.prototype$downvote({id: article.articleId});
   }
}]);
