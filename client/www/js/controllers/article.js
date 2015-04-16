var app = angular.module('instanews.article', ['ionic', 'ngResource', 'underscore']);

app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Articles',
      'Position',
      '_',
      function($scope,
         $stateParams,
         Article,
         Articles,
         Position,
         _) {

   //Scope variables
   $scope.subarticles = [];
   $scope.article = Articles.getOne($stateParams.id);
   $scope.itemsAvailable = true;

   var filter = {
      limit: 10,
      skip: 0,
      order: 'rating DESC'
   }

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.afterEnter', function() {
      var map = Position.getArticleMap();
      if(map) {
         google.maps.event.trigger(map, 'resize');
      }
   });

   var load = function(cb) {
      Article.subarticles({id: $stateParams.id, filter: filter })
      .$promise
      .then( function (subarticles) {
         if ( subarticles.length <= 0 ) {
            $scope.itemsAvailable = false;
         }
         else {
            //Update our skip amount
            filter.skip += subarticles.length;

            //Set the top article and remove duplicates
            for( var i = 0; i < subarticles.length; i++) {
               var subarticle = subarticles[i];

               //Remove duplicates
               for(var j = 0; j < $scope.subarticles.length; j++ ) {
                  var sub = $scope.subarticles[j];
                  if( sub.myId === subarticle.myId) {
                     subarticles.splice(i,1);
                     break;
                  }
               }
            }

            //Update our local subarticles
            $scope.subarticles = $scope.subarticles.concat(subarticles);
         }

         cb();
      });
   };

   $scope.onRefresh = function () {
      console.log('Refresh');

      //Reset all necessary values
      $scope.itemsAvailable = true;
      filter.skip = 0;
      $scope.subarticles = [];

      //Load the initial articles
      load( function() {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   $scope.loadMore = function() {
      _.debounce( load( function() {
         console.log('Loading more');
         $scope.$broadcast('scroll.infiniteScrollComplete');
      }), 500);
   };
}]);

