
var cb = function(err, res) {
   if (err) {
      console.log(err);
   }
   console.log(res);
};

angular
.module('instanews.feed', ['ionic', 'ngResource'])
.controller('FeedCtrl', ['$scope', '$state', 'Article', function($scope, $state, Article) {
   //$scope.articles = $resource('/api/articles');
   $scope.articles = [];

   function getArticles() {
      Article.find()
      .$promise
      .then( function (res) {
         $scope.articles = res;
      });
   }

   getArticles();

   $scope.upvote = function(article, $index) {
      Article.prototype$upvote({id: article.articleId}, function (res) {
         for(i = 0; i < $scope.articles.length; i++) {
            if($scope.articles[i].articleId === article.articleId) {
               $scope.articles[i]._votes = res.article._votes;
               return;
            }
         }
      });
   }

   $scope.downvote = function(article, $index) {
      Article.prototype$downvote({id: article.articleId}, function (res) {
         for(i = 0; i < $scope.articles.length; i++) {
            if($scope.articles[i].articleId === article.articleId) {
               $scope.articles[i]._votes = res.article._votes;
               return;
            }
         }
      });
   }
}]);
