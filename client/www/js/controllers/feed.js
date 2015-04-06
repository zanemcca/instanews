var app = angular.module('instanews.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', [
      '$scope',
      'Article',
      'Common',
      function($scope,
         Article,
         Common) {

   $scope.articles = Common.getArticles();

   var filter = {
      limit: 1,
      skip: 0,
      include: {
         relation: 'subarticles',
         scope: {
            limit: 1,
            order: 'rating DESC'
         }
      },
      order: 'rating DESC'/*,
       //TODO Try this again once loopback 2.24.0 comes out
      where: {
         location: {
            lat: {
               between: [40,50]
            },
            lng: {
               between: [-70,-60]
            }
         }
      }
      */
   }

   $scope.onRefresh = function () {
      console.log('Refresh');

      //Reset all necessary values
      $scope.itemsAvailable = true;
      filter.skip = 0;
      $scope.articles = [];
      Common.setArticles($scope.articles);

      //Load the initial articles
      load( function() {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   var load = function(cb) {

      /* TODO Take into account fringe cases where content crosses pages.
       * Only dealing with duplicates for the moment
       */
      Article.find({filter: filter })
      .$promise
      .then( function (articles) {
         if ( articles.length <= 0 ) {
            $scope.itemsAvailable = false;
         }
         else {
            //Update our skip amount
            filter.skip += articles.length;

            //Set the top article and remove duplicates
            for( var i = 0; i < articles.length; i++) {
               var article = articles[i];

               //Remove duplicates
               if (Common.getArticle(article.myId)) {
                  articles.splice(i,1);
                  continue;
               }
               else if (article.subarticles.length > 0) {
                  //Set the top subarticle
                  article.topSub = article.subarticles[0];
               }
            }

            //Update our local articles
            $scope.articles = $scope.articles.concat(articles);

            //Update the global articles list
            Common.setArticles($scope.articles);
         }

         cb();
      });
   };

   $scope.loadMore = function() {
      console.log('Loading more');
      load( function() {
         $scope.$broadcast('scroll.infiniteScrollComplete');
      });
   };

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.afterEnter', function() {
      google.maps.event.trigger(Common.getFeedMap(), 'resize');
   });

   //Initialization
   $scope.onRefresh();
}]);
