var app = angular.module('instanews.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Common',
      function($scope,
         $stateParams,
         Article,
         Common) {

   //Scope variables
   $scope.subarticles = [];
   $scope.article = Common.getArticle($stateParams.id);
   $scope.itemsAvailable = true;

   var lastUpdate = new Date(1975,1);

   var loadLimit = 3;

   var filter = {
      limit: loadLimit,
      skip: 0,
      order: 'rating DESC'/*,
      where: {
         date: {gt: lastUpdate}
      }*/
   }

   var getSubarticles = function(cb) {

      filter.skip = 0;
 //     lastUpdate = new Date(1975,1);
 //     filter.where.date.gt = lastUpdate;
      Article.subarticles({id: $stateParams.id, filter: filter})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
         $scope.itemsAvailable = true;
         if (cb) cb();
      });
   };

   getSubarticles();

   //Refresh the map everytime we enter the view
   $scope.$on('$ionicView.afterEnter', function() {
      google.maps.event.trigger(Common.getArticleMap(), 'resize');
   });


   //TODO Only load modified or new subarticles
   //    not all of them. I think server side session
   //    management is the key
   $scope.loadMore = function () {
      filter.limit = $scope.subarticles.length + loadLimit;
      //TODO Dynamic loadLimit based on scroll speed & ping time

      Article.subarticles.count({id: $stateParams.id})
      .$promise
      .then ( function (res) {

         var count = res.count;

         Article.subarticles({
            id: $stateParams.id,
            filter: filter
         })
         .$promise
         .then( function (res) {
            if (res.length >= count) {
               console.log('No more items');
               $scope.itemsAvailable = false;
            }
            for(var j = 0; j < res.length; j++) {
               item = res[j];
               var update = false;
               for(var i = 0; i < $scope.subarticles.length; i++ ) {
                  var sub = $scope.subarticles[i];
                  if( sub.myId === item.myId) {
                     update = true;
                     if ( Date.parse(sub.date) < Date.parse(item.date)) {
                        //Only update the votes for now so that media doesn't
                        //have to reload
                        sub._votes = item._votes;
                        sub.date = item.date;

                        console.log('Updated: ' + item.text);
                        console.log('@ ' + item.date);
                        if ( item._file) {
                           console.log(item._file.name);
                        }
                     }
                     break;
                  }
               }
               if(!update) {
                  $scope.subarticles.push(item);
               }

               /*
               //Set our last update as the latest updated article we recieve back
               //This makes sure there is no possibility of forming gaps .
               var tempDate = Date.parse(item._votes.lastUpdated);
               if ( lastUpdate < tempDate) {
                  console.log('lastUpdate: ' + lastUpdate + '\tRemote: ' + tempDate);
                  lastUpdate = tempDate;
                 // filter.where.date.gt = lastUpdate;
               }
               */
            }
         });
      });

      $scope.$broadcast('scroll.infiniteScrollComplete');
   };

   $scope.onRefresh = function () {
      getSubarticles( function () {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

}]);

