'use strict';

var app = angular.module('instanews.directive.heightCorrector', []);

app.directive('inHeightCorrector', [
  'Device',
  function (
    Device 
  ) {
    return {
      restrict: 'AC',
      link: function(scope, element) {
        if(Device.isIOS() && !Device.isBrowser()) {
          var keyboardShow = function() {
            var height = Device.getHeight();
            element.css({
              'min-height': height + 'px'
            });
          };

          var keyboardHide = function() {
            element.css({
              'min-height': 0
            });
          };

          window.addEventListener('native.keyboardhide', keyboardHide);
          window.addEventListener('native.keyboardshow', keyboardShow);

          scope.$on('$destroy', function() {
            window.removeEventListener('native.keyboardshow', keyboardShow);
            window.removeEventListener('native.keyboardhide', keyboardHide);
          });
        }
      }
    };
  }
]);
