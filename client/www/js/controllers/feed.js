var app = angular.module('instanews.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', ['$scope', 'Article', 'Common',  function($scope, Article, Common) {

   $scope.articles = Common.articles;

   $scope.upvote = function(article, $index) {
      console.log('Before: ', article);
      Article.prototype$upvote({id: article.articleId}, function (res) {
         article._votes = res.article._votes;
         console.log('After: ', article);
         //Common.updateArticle(article);
      });
   }

   $scope.downvote = function(article, $index) {
      Article.prototype$downvote({id: article.articleId}, function (res) {
         article._votes = res.article._votes;
 //        Common.updateArticle(article);
      });
   }
}]);
