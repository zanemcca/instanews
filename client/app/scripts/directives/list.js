
'use strict';
var app = angular.module('instanews.directive.list', ['ionic']);

app.directive('inListItem', [
  '$timeout',
  'Position',
  'View',
  function (
    $timeout,
    Position,
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
         item: '='
      },
      controller: function() {},
      templateUrl: 'templates/directives/list.html',
      //link: function($scope,element, attributes) {
      link: function($scope) {

        var date = Date.parse($scope.item.created);
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

        $scope.age = {
          age: Math.round(age),
          unit: unit
        };

        $scope.getItemTemplate = getItemTemplate;

        var position = Position.getPosition();

        var view = {
          viewableId: $scope.item.id,
          viewableType: $scope.item.modelName
        };

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
        .then(function() {
          console.log('View created: ' + $scope.item.id);
        }, function(err) {
          console.log('Error: Failed to create a view');
          console.log(err);
        });

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
}]);
