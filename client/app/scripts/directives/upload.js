
'use strict';
var app = angular.module('instanews.directive.upload', [
  'ionic',
  'ngResource',
  'ngMaterial'
]);

// Video controller
/*
app.controller(
  'uploadCtrl', [
    '$scope',
    '_',
    'FileTransfer',
    'ENV',
    function (
      $scope,
      _,
      FileTransfer,
      ENV
    ) {
    }]
);
*/


//TODO On complete we need to delete local files

//This directive will display subarticle upload in a consumable format
// istanbul ignore next
app.directive(
  'inupload', [
    function (
    ) {
      return {
        restrict: 'E',
        scope: {
          upload: '='
        },
        controller: function ($scope, TextInput) {
          var newText = '';
          var textInput;
          if($scope.upload.subarticle.text) {
            $scope.edit = function () {
              textInput = TextInput.get('modal');
              textInput.placeholder = 'What\'s the story?';
              newText = newText || $scope.upload.subarticle.text;
              textInput.text = newText;

              textInput.open(function (text) {
                $scope.upload.subarticle.text = text; 
              }, function (partialText) {
                //Interruption function
                newText = partialText;
              });
            };
          } else {
            $scope.caption = {
              edit: function () {
                textInput = TextInput.get('modal');
                textInput.placeholder = 'What\'s the caption?';
                newText = newText || $scope.upload.subarticle._file.caption;
                textInput.text = newText;

                textInput.open(function (text) {
                  $scope.upload.subarticle._file.caption = text;
                  }, function (partialText) {
                  //Interruption function
                  newText = partialText;
                });
              }
            };
          }
          $scope.is = {
            mine: function () {
              return !$scope.upload.isPosting;
            }
          };
        },
        link: function ($scope) {
          $scope.upload.resolve();
        },
        templateUrl: 'templates/directives/upload.html'
      };
    }]
);
