var app = angular.module('instanews.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', ['$scope', 'Article', 'Common', 'Comment', function($scope, Article, Common, Comment) {

   $scope.articles = Common.articles;
   $scope.onRefresh = Common.onRefresh;

   $scope.createComment = function( article, content) {
      Common.createComment(Article, article,'article', content);
   };

   $scope.upvoteComment = function(comment) {
      Common.upvote(Comment, comment);
   };

   $scope.downvoteComment = function(comment) {
      Common.downvote(Comment, comment);
   };

   $scope.upvote = function(article) {
      Common.upvote(Article,article);
   };

   $scope.downvote = function(article) {
      Common.downvote(Article,article);
   };

   $scope.toggleComments = function(article) {
      Common.toggleComments(Article,article);
   };
}]);
