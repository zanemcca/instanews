
'use strict';
var app = angular.module('instanews.controller.feed', ['ionic', 'ngResource', 'monospaced.elastic']);

app.controller('FeedCtrl', [
  '$scope',
  '$location',
  '$timeout',
  '$ionicNavBarDelegate',
  'Article',
  'Dialog',
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
    $ionicNavBarDelegate,
    Article,
    Dialog,
    Maps,
    Position,
    Platform,
    preload,
    Articles,
    Navigate,
    Notifications,
    User
  ) {

    if(Platform.isBrowser() && !Platform.isValidCountry(window.geo.country)) { 
      Dialog.alert(
        'You can still access all of our great crowdsourced news abroad',
        'instanews is not yet available in your country');
    }

    $scope.Articles = Articles.getLoader({
      preload: true,
      filter: function(articles) {
        //Ensure articles are w ithin view before adding to the list
        //This takes care of any race conditions between the preloading queue and bounds updating
        var arts = [];
        for(var i in articles) {
          var position = Position.posToLatLng(articles[i].loc);
          if(Position.withinBounds(position)) {
            arts.push(articles[i]);
          }
        }

        return arts;
      },
      keepSync: true
    });

    $scope.findNews = function() {
      var map = Maps.getFeedMap();
      if(map) {
        var center = map.getCenter();
        Articles.findNearest({
          coords: {
            latitude: center.lat(),
            longitude: center.lng()
          }
        }, function(err, res) {
          if(err) {
            Dialog.alert(
              'There was an error trying to find more news. Please try to use the map instead.',
              'Sorry!');
            console.log(err);
          } else {
            if(res.length) {
              var idx = 0;
              for(var i in res) {
                if(res[i].rating > res[idx].rating) {
                  idx = i;
                }
              }
              map.setZoom(10);
              Maps.setCenter(map, Position.posToLatLng(res[idx].loc));
            } else {
              Dialog.alert(
                'We could not find any modern news. Do you have something news worthy? Put it on the map',
                'No News');
            }
          }
        });
      } else {
        console.log('map not setup yet');
        Dialog.alert(
          'Please try again',
          'The map is not ready yet');
      }
    };

    $scope.isLoading = function() {
      if($scope.Articles.areItemsAvailable()) {
        return true;
      } else {
        return false;
      }
    };

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
      $timeout: $timeout.bind(this),
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
            Maps.setCenter(map, place.geometry.loc);
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

    // No Header on mobile browsers to save on space
    if(Platform.isBrowser() && Platform.isMobile() && !Platform.isTablet()) {
      $scope.$on('$ionicView.beforeEnter', function() {
        $ionicNavBarDelegate.showBar(false);
        Platform.ready.then(function() {
          $ionicNavBarDelegate.showBar(false);
        });
      });
    }

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      $scope.$broadcast('afterEnter');
      Articles.inView = true;
      Preload.reset();
      var map = Maps.getFeedMap();
      /* istanbul ignore else */
      if(map) {
        google.maps.event.trigger(map, 'resize');
        if(!Position.getBounds()) {
          Position.setBounds(map.getBounds());
        }
      }

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
