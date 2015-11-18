
'use strict';
var app = angular.module('instanews.controller.feed', ['ionic', 'ngResource']);

app.controller('FeedCtrl', [
  '$scope',
  'Article',
  'Maps',
  'Position',
  'Platform',
  'Articles',
  'Navigate',
  function(
    $scope,
    Article,
    Maps,
    Position,
    Platform,
    Articles,
    Navigate
  ) {

    $scope.Articles = Articles;

   // $scope.articles = $scope.Articles.get();
    $scope.toggleMenu = Navigate.toggleMenu;
    $scope.place = {
      //types: ['(regions)'],
      getMap: Maps.getFeedMap
    };

    $scope.map = {
      id: 'feedMap'
    };

    var geocoder = new google.maps.Geocoder();

    $scope.$watch(function (scope) {
      return scope.place.value;
    }, function (newValue, oldValue) {
      if(newValue !== oldValue) {

        var centerMap = function (place) {
          var map = Maps.getFeedMap();
          if(place.geometry.viewport) {
            Maps.fitBounds(map, place.geometry.viewport);
          }
          else {
            Maps.setCenter(map, place.geometry.location);
          }
        };

        console.log('New place!');
        console.log(newValue);

        if(newValue.geometry) {
          centerMap(newValue);
        } else {
          geocoder.geocode({'address': newValue.description}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              centerMap(results[0]);
            } else {
              console.log('Geocode was not successful for the following reason: ' + status);
            }
          }); 
        }
      }
    });

    $scope.title = Platform.getAppNameLogo();

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      var map = Maps.getFeedMap();
      /* istanbul ignore else */
      if(map) {
        google.maps.event.trigger(map, 'resize');
      }
     });



    /*
       $scope.scrollTop = Navigate.scrollTop;

       $scope.scrollTopVisible = false;

       $scope.onSwipeDown = function () {
       $scope.scrollTopVisible = true;
       setTimeout(function () {
       $scope.$apply(function () {
       $scope.scrollTopVisible = false;
       });
       }, 2000);
       };
       */
    /*
    // Refresh the articles completely
    $scope.onRefresh = function () {
    console.log('Refresh');

//Reset all necessary values
//Articles.deleteAll();

//Load the initial articles
Articles.load( function() {
$scope.$broadcast('scroll.refreshComplete');
});
};
*/
    /*istanbul ignore next */
    /*
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase === '$apply' || phase === '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    var items = {
      available: function () {
        return false;
      }
    }; 

    $scope.itemsAvailable = function () { 
      return items.available();
    };

    Position.boundsReady
    .then(function () {
      items.available = Articles.areItemsAvailable;
    });
   */
    // This is called when the bottom of the feed is reached
    /*
    $scope.loadMore = function() {
      console.log('Loading more articles');
      Articles.load( function() {
        $scope.safeApply(function(){
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      });
    };

    */
    //Update our local articles
    //var first = true;
    /*
    var updateArticles = function() {
      $scope.articles = Articles.get();
    };

    //Update the map if the articles are updated
    Articles.registerObserver(updateArticles);
   */
  }
]);
