
var app = angular.module('instanews.common', ['ionic', 'ngResource']);

app.service('Common', ['Article', function(Article){

   var articles = Article.find();

   /*
   return {
      getArticles: function () {
         return articles;
      },
      updateArticle: function (article) {
         articles.splice(articles.indexOf(article),1,article);
      }
   };
   */
   return {
      articles: articles
   };
}]);
