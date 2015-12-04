
// jshint camelcase: false
'use strict';
var app = angular.module('instanews.directive.speedDial', ['ionic']);

app.directive('inSpeedDial', [
  'Post',
  function (
    Post
  ) {
    return {
      restrict: 'E',
      scope: {
        position: '=',
        uploads: '='
      },
      controller: function ($scope) {
        //$scope.uploads = Uploads.findOrCreate($scope.id);

        /*
         * TODO Get this working
        $scope.create = function () {
          var textInput = TextInput.get();
          if($scope.owner.commentableId) {
            textInput.placeholder = 'Write a reply...';
          }
          textInput.text = newComment;

          textInput.open(function (text) {
            Comment.create({
              content: text,
              commentableId: $scope.owner.id,
              commentableType: $scope.owner.modelName
            }).$promise
            .then(function(res,err) {
              // istanbul ignore if 
              if(err) {
                console.log(err);
              }
              else {
                //TODO Add to the Comment list
                //$scope.owner.comments.push(res);
              }
            });
          }, function (partialText) {
            //Interruption function
            newComment = partialText;
          });
        };
        */
    },
    link: function($scope) {
      if(!$scope.position) {
        $scope.position = 'bottom-right';
      }
    },
    templateUrl: 'templates/directives/speedDial.html'
  };
  }
]);
