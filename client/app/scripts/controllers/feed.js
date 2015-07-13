
'use strict';
var app = angular.module('instanews.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', [
      '$scope',
      'Article',
      'Maps',
      'Position',
      'Articles',
      'Navigate',
      function($scope,
         Article,
         Maps,
         Position,
         Articles,
         Navigate) {

   $scope.articles = Articles.get();
   $scope.toggleMenu = Navigate.toggleMenu;
   $scope.scrollTop = Navigate.scrollTop;


// Heat Map ======================================================

   var heatmap;

   function createGradient() {

      var third = 8;
      var subValue = 256/third;

      //Transistion from baby blue to blue to red
      var gradient = ['rgba(0, 255, 255, 0)'];
      for(var i = 0; i < third; i++) {
         var temp =  'rgba(0,' + (255-subValue*i) + ',255, 1)';
         gradient.push(temp);
      }
      for(i = 0; i < third; i++) {
         gradient.push( 'rgba(0,0,'+ (255 - subValue/2*i) +', 1)');
      }
      for(i = 0; i < third; i++) {
         gradient.push( 'rgba('+ (subValue*i) +',0,'+ (128 - subValue/2*i) +', 1)');
      }
      gradient.push('rgba(255, 0, 0, 1)');

      return gradient;
   }

   function updateHeatmap() {
      var articleHeatArray = [];

      if( !Position.getBounds()) {
         return;
      }

      for(var i = 0; i < $scope.articles.length; i++) {
         var position = Position.posToLatLng($scope.articles[i].location);
         if (Position.withinRange(position) && $scope.articles[i].rating > 0) {
            articleHeatArray.push({
               location: position,
               weight: $scope.articles[i].rating
            });
         }
      }

      if (!heatmap) {

         heatmap = new google.maps.visualization.HeatmapLayer({
            map: Maps.getFeedMap(),
            gradient: createGradient(),
            data: articleHeatArray
         });
      }
      else {
         heatmap.setData(articleHeatArray);
      }
   }

//#############################################

   var updateMap = function() {
      $scope.articles = Articles.get();
      updateHeatmap();
      console.log('Updating map');
   };

   //Update the map if the articles are updated or
   //if bounds get updated
   Articles.registerObserver(updateMap);
   Position.registerObserver(updateMap);

   $scope.localize = function() {
      var map = Maps.getFeedMap();
      if( map) {
         Maps.localize(map);
      }
      else {
         console.log('Map not valid! Cannot localize!');
      }
   };

   /*
   $scope.scroll = {
      buttonOn: false
   };

   //TODO get the scroll to top button disabling appropriately
   $scope.onScroll = function() {
      $scope.scroll.buttonOn = Navigate.onScroll();
      console.log('Scroll top on ? ' + $scope.scroll.buttonOn);
   };

  //TODO Rewrite this use ionic on-swipe-down gesture
  */

   $scope.itemsAvailable = true;

   var filter = {
      limit: 50,
      skip: 0,
      include: {
         relation: 'subarticles',
         scope: {
            limit: 1,
            order: 'rating DESC'
         }
      },
      order: 'rating DESC'
   };

   $scope.onRefresh = function () {
      console.log('Refresh');

      //Reset all necessary values
      $scope.itemsAvailable = true;
      filter.skip = 0;
      $scope.articles = [];
      Articles.set($scope.articles);

      //Load the initial articles
      load( function() {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };


   var reload = function() {

      var bounds = Position.getBounds();

      if(bounds) {
         var sw = bounds.getSouthWest();
         var ne = bounds.getNorthEast();
         filter.skip = 0;
         filter.where = {
            location: {
               geoWithin: {
                  $box: [
                     [sw.lat(), sw.lng()],
                     [ne.lat(), ne.lng()]
                  ]
               }
            }
         };

         $scope.articles = [];
         Articles.set($scope.articles);
         load( function() {
            console.log('Loaded new articles within the new bounds: ' + $scope.articles.length);
         });
      }
      else {
         console.log('Bounds not set yet!');
      }
   };

   Position.registerBoundsObserver(reload);

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
               if (Articles.getOne(article.id)) {
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
            Articles.set($scope.articles);
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
      var map = Maps.getFeedMap();
      if(map) {
         google.maps.event.trigger(map, 'resize');
      }
   });
}]);
