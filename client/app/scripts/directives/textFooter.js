'use strict';

var app = angular.module('instanews.directive.textFooter', ['ionic', 'ngResource']);

app.directive('inTextFooter', [
  'Platform',
  'Navigate',
  'TextInput',
  function (
    Platform,
    navigate,
    TextInput
  ) {

    return {
      restrict: 'E',
      scope: true, 
      controller: function($scope) {
        var defaultPlaceholder = 'Write a comment...';
        $scope.input = {
          placeholder: defaultPlaceholder,
          text: '',
          maxLength: 300 
        };

        $scope.box = {
          visible: false
        };

        var Navigate = navigate();

        function keyboardHideHandler(){
          $scope.$apply(function () {
            console.log('Interruption!');
            if(interruptionCB) {
              interruptionCB($scope.input.text);
            }
            $scope.box.visible = false;
            onSubmit = null;
            $scope.input.text = '';
            $scope.input.placeholder = defaultPlaceholder;
            window.removeEventListener('native.keyboardhide', keyboardHideHandler);
          });
        }

        $scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
          var elem = document.getElementById($scope.input.boxId);
          var border = 15.667; 
          elem.style.height = (newHeight + border*2) + 'px';
        });

        $scope.$parent.$on('$ionicView.afterEnter', function() {
          TextInput.register($scope.input);
        });

        var onSubmit,
          interruptionCB;
        //TODO Move this into the service
        $scope.input.open = function (done, interrupted) {
          $scope.box.visible = true;
          onSubmit = done;
          interruptionCB = interrupted;
          Platform.keyboard.show();
          Navigate.focus($scope.input.id);
          window.addEventListener('native.keyboardhide', keyboardHideHandler);
        };

        $scope.onSubmit = function () {
          if(onSubmit) {
            onSubmit($scope.input.text);
            $scope.box.visible = false;
            $scope.input.text = '';
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
