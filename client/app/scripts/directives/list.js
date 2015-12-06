
// jshint camelcase: false
'use strict';
var app = angular.module('instanews.directive.list', ['ionic']);

app.directive('inList', [
  'Platform',
  function (
    Platform
  ) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        list: '=',
        isCard: '=',
        isNotInfinite: '='
      },
      controller: function ($scope, _) {
        $scope.isTablet = Platform.isTablet;

        $scope.safeApply  = function(fn) {
          var phase = this.$root.$$phase;
          if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };

        $scope.load = _.debounce(function() {
          $scope.list.load( function() {
            $scope.safeApply(function(){
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
          });
        }, 1000);
      },
      templateUrl: 'templates/directives/list.html'
    };
  }
]);

app.directive('inListItem', [
  '$timeout',
  'Position',
  'User',
  'View',
  function (
    $timeout,
    Position,
    User,
    View
  ) {

    var getItemTemplate = function(item) {
      var template = 'templates/directives/';
      switch(item.modelName) {
        case 'article':
          template = template.concat('articlePreview.html'); 
        break;
        case 'subarticle':
          template = template.concat('subarticle.html'); 
        break;
        case 'comment':
          template = template.concat('comment.html'); 
        break;
        default: 
          template = '';
        console.log('Error: Unknown model name: ' + item.modelName);
        break;
      }
      return template;
    };

    return {
      restrict: 'E',
      scope: {
        item: '=',
        isCard: '=',
        preLoad: '='
      },
      controller: function($scope, $timeout, Maps) {
        var WHITELIST = [
          'route',
          'neighborhood',
          'locality',
          'administrative_area_level_1',
          'country'
        ];

        var feedMap = Maps.getFeedMap();
        $scope.location = {};

        var setPlaceName = function () {
          $timeout(function () {
            $scope.$apply(function () {
            var whitelist = WHITELIST.slice(0);
            var zoom = feedMap.getZoom();

            if(zoom <= 9) {
              whitelist.shift();
            }
            if(zoom <= 7) {
              whitelist.shift();
            }

            //console.log(zoom);
            //console.log(whitelist);
            var place = $scope.item.place;
            if(place) {
              for(var i in place) {
                if(whitelist.indexOf(place[i].types[0]) > -1) {
                  //console.log(place[i].long_name);
                  $scope.location.name = place[i].long_name;
                  return;
                }
              }
            }
            });
          });
        };

        setPlaceName();
        feedMap.addListener('zoom_changed', setPlaceName);
      },
      templateUrl: 'templates/directives/listItem.html',
      //link: function($scope,element, attributes) {
      link: function($scope) {

        $scope.getItemTemplate = getItemTemplate;

        // TODO Use the new subarticle retrieval to trigger views instead of using an api
        // But we have to be careful because we are caching things so the
        // view still has to go through even if its a cache hit
        //    Because of above assertion we need to wait to replace this till we have
        //    proper refreshing reinstated in the lists. 
        var createView = function () {
          if(User.get()) {
            var position = Position.getPosition();

            var view = {
              viewableId: $scope.item.id,
              viewableType: $scope.item.modelName
            };

            // istanbul ignore else
            if(position.coords) {
              view.location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
            }
            else {
              console.log('Warning: Invalid location for view');
            }

            View.create(view).$promise
            .then(
              // istanbul ignore next 
              function() {
                //console.log('View created: ' + $scope.item.id);
              }, 
              // istanbul ignore next 
              function(err) {
                console.log('Error: Failed to create a view');
                console.log(err);
              });
          }
        };



        //console.log($scope.item);
        if($scope.preLoad instanceof Function) {
          $scope.preLoad($scope.item, createView);
        } else {
          createView();
        }

        /*
           var onRelease = function() {
           $scope.position = $ionicScrollDelegate.getScrollPosition().top;
           console.log('Position: ' + $scope.position);
           };

           $timeout(function() {
           console.log('Height: ' + element[0].offsetHeight);
           }, false);

           $ionicGesture.on('on-release', onRelease, element, options);
           */
      }
    };
  }
]);
