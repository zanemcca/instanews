
'use strict';

angular
.module('app', [
      'lbServices',
      'ui.router'
      ])
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
   $stateProvider
   .state('feed', {
      url: '',
      templateUrl: 'views/feed.html',
      controller: 'FeedCtrl'
   })
   .state('article', {
      url: '/articles/{id}',
      templateUrl: 'views/article.html',
      controller: 'ArticleCtrl'
   });

   $urlRouterProvider.otherwise('');
}]);