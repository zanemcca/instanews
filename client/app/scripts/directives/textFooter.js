'use strict';

var app = angular.module('instanews.directive.textFooter', ['ionic', 'ngResource']);

app.directive('inTextFooter', [
  'Platform',
  'TextInput',
  function (
    Platform,
    TextInput
  ) {

    return {
      restrict: 'E',
      scope: true, 
      controller: function($scope) {
        var defaultPlaceholder = 'Write a comment...';
        $scope.input = {
          placeholder: defaultPlaceholder 
        };

        $scope.box = {
          visible: false
        };

        function keyboardHideHandler(){
          $scope.$apply(function () {
            $scope.box.visible = false;
            onSubmit = null;
            $scope.input.text = null;
            $scope.input.placeholder = defaultPlaceholder;
            window.removeEventListener('native.keyboardhide', keyboardHideHandler);
          });
        }

        $scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
          var elem = document.getElementById('text-footer');
          var border = 15.667; 
          elem.style.height = (newHeight + border*2) + 'px';
        });

        $scope.$parent.$on('$ionicView.afterEnter', function() {
          TextInput.register($scope.input);
        });

        var onSubmit;
        //TODO Move this into the service
        $scope.input.open = function (cb) {
          $scope.box.visible = true;
          onSubmit = cb;
          Platform.keyboard.show();
          window.addEventListener('native.keyboardhide', keyboardHideHandler);
        };

        $scope.onSubmit = function () {
          if(onSubmit) {
            onSubmit($scope.input.text);
            $scope.box.visible = false;
            $scope.input.text = null;
            $scope.input.placeholder = defaultPlaceholder;
            onSubmit = null;
          } else {
            console.log('No submit function defined yet!');
          }
        };

        TextInput.register($scope.input);
      },
      templateUrl: 'templates/directives/textFooter.html'
    };
  }]);
