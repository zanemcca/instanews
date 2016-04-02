
'use strict';
var app = angular.module('instanews.controller.feed', ['ionic', 'ngResource', 'monospaced.elastic']);

app.controller('FeedCtrl', [
  '$scope',
  '$location',
  '$timeout',
  'Article',
  'Maps',
  'Position',
  'Platform',
  'preload',
  'Articles',
  'Navigate',
  'Notifications',
  'User',
  function(
    $scope,
    $location,
    $timeout,
    Article,
    Maps,
    Position,
    Platform,
    preload,
    Articles,
    Navigate,
    Notifications,
    User
  ) {
    $scope.Articles = Articles.getLoader({
      preload: true,
      filter: function(articles) {
        //Ensure articles are w ithin view before adding to the list
        //This takes care of any race conditions between the preloading queue and bounds updating
        var arts = [];
        for(var i in articles) {
          var position = Position.posToLatLng(articles[i].location);
          if(Position.withinBounds(position)) {
            arts.push(articles[i]);
          }
        }

        return arts;
      },
      keepSync: true
    });

    $scope.toggleMenu = function () {
      if(Navigate.toggleMenu()) {
        Notifications.reload();
        Notifications.getBadge().clear();
      }
    };

    // Prepare our autocompletion by linking it to out feedmap
    /*
    $scope.place = {
      //types: ['(regions)'],
      getMap: Maps.getFeedMap
    };
    */

    $scope.place = Maps.getNewPlace();
    $scope.place.ignore = null;
    $scope.place.getMap =  Maps.getFeedMap;

    // Prepare our map by initializing its id
    $scope.map = {
      id: 'feedMap'
    };

    $scope.preScrollToTop = function (cb) {
      Preload.stop();
      cb();
      Preload.reset();
    };

    var Preload = preload({
      scrollHandle: 'feed',
//      $timeout: $timeout,
      list: $scope.Articles
    });

    //$scope.plot = Preload.plot;

    $scope.badge = Notifications.getBadge();

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

    // Set the title of the app
    $scope.title = Platform.getAppNameLogo();

    $scope.post = function () {
      Navigate.go('app.articlePost');
    };

    //Register an observer on the bounds that will restart the predictor
    Position.registerBoundsObserver(function () {
      if(Articles.inView) {
        Preload.reset();
      }
    });

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      Articles.inView = true;
      Preload.reset();
      var map = Maps.getFeedMap();
      /* istanbul ignore else */
      if(map) {
        google.maps.event.trigger(map, 'resize');
      }
      Articles.reorganize();  //Reorganize the cached list to remove any out of view articles

      Platform.analytics.trackView('Feed View');

      User.reload();
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Articles.inView = false;
      Preload.stop();
    });

    $scope.$on('$ionicView.unloaded', function() {
      $scope.Articles.remove();
    });
  }
]);
