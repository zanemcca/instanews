
var cb = function(err, res) {
   if (err) {
      console.log(err);
   }
   console.log(res);
};

angular
.module('instanews.feed', ['ionic', 'ngResource'])
.controller('FeedCtrl', ['$scope', '$state', 'Article','Common',  function($scope, $state, Article, Common) {

   $scope.articles = Common.getArticles();

   $scope.upvote = function(article, $index) {
      Article.prototype$upvote({id: article.articleId}, function (res) {
         article._votes = res.article._votes;
         Common.updateArticle(article);
      });
   }

   $scope.downvote = function(article, $index) {
      Article.prototype$downvote({id: article.articleId}, function (res) {
         article._votes = res.article._votes;
         Common.updateArticle(article);
      });
   }
}]);
