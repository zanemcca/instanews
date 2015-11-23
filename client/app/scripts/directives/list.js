
'use strict';
var app = angular.module('instanews.directive.list', ['ionic', 'angularMoment']);

app.directive('inList', [
  function (
  ) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        list: '='
      },
      controller: function ($scope, _) {
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

        $scope.onInfinite = _.debounce(function() {
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
        preLoad: '='
      },
      controller: function() {},
      templateUrl: 'templates/directives/listItem.html',
      //link: function($scope,element, attributes) {
      link: function($scope) {

        var getAgeString = function (created) {
          var date = Date.parse(created);
          var age = Date.now() - date; 
          age /= 1000;
          var unit = 'seconds';
          if(age > 60) {
            age /= 60;
            unit = 'minutes';
            if(age > 60) {
              age /= 60;
              unit = 'hours';
              if(age > 24) {
                age /= 24;
                unit = 'days';
                if(age > 7) {
                  age /= 7;
                  unit = 'weeks';
                  if(age > 52) {
                    age /= 52;
                    unit = 'years';
                  }
                }
              }
            }
          }

          return {
            age: Math.round(age),
            unit: unit
          };
        };

        $scope.age = getAgeString($scope.item.created);

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
                console.log('View created: ' + $scope.item.id);
              }, 
              // istanbul ignore next 
              function(err) {
                console.log('Error: Failed to create a view');
                console.log(err);
              });
          }
        };

        console.log($scope.item);
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
