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
        $scope.input = {
          placeholder: 'Write a comment...'
        };

        $scope.input.visible = false;

        function keyboardHideHandler(){
          $scope.$apply(function () {
            $scope.input.visible = false;
            onSubmit = null;
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
        $scope.input.open = function (cb) {
          $scope.input.text = null;
          $scope.input.visible = true;
          onSubmit = cb;
          Platform.keyboard.show();
          window.addEventListener('native.keyboardhide', keyboardHideHandler);
        };

        $scope.onSubmit = function () {
          if(onSubmit) {
            onSubmit($scope.input.text);
            $scope.input.visible = false;
            $scope.input.text = null;
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
