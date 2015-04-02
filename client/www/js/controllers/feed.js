var app = angular.module('instanews.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', [
      '$scope',
      'Article',
      'Common',
      function($scope,
         Article,
         Common) {

   $scope.articles = [];

   var loadLimit = 10;
   $scope.onRefresh = function () {
      var filter = {
         limit: loadLimit,
         include: {
            relation: 'subarticles',
            scope: {
               limit: 1,
               order: 'rating DESC'
            }
         },
         order: 'rating DESC'
      }

      Article.find({filter: filter })
      .$promise
      .then( function (res) {
         $scope.articles = res;

         for( var i = 0; i < $scope.articles.length; i++) {
            var article = $scope.articles[i];
            if (article.subarticles.length > 0) {
               article.topSub = article.subarticles[0];
            }
         }

         Common.setArticles(res);

         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   $scope.onRefresh();

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.enter', function() {
      google.maps.event.trigger(Common.getFeedMap(), 'resize');
   });

   //TODO load more server side using session management
   $scope.loadMore = function() {
      console.log('No more articles');
      $scope.itemsAvailable = false;
      $scope.$broadcast('scroll.infiniteScrollComplete');
   };
}]);
