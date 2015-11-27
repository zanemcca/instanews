'use strict';

var app = angular.module('instanews.directive.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
  'Comment',
  'Comments',
  'Navigate',
  'TextInput',
  function (
    Comment,
    Comments,
    Navigate,
    TextInput
  ) {

    return {
      restrict: 'E',
      scope: {
        owner: '='
      }, 
      controller: function($scope) {

        $scope.Comments = Comments.findOrCreate($scope.owner.modelName, $scope.owner.id);
        var spec = $scope.Comments.getSpec();

        $scope.$watch('owner.showComments', function (newVal, oldVal) {
          if( newVal && !oldVal) {
            spec.options.filter.skip = 0;
            spec.options.filter.limit = 5;
            $scope.Comments.load();
          }
        });

        var newComment = '';

        $scope.create = function () {
          Navigate.ensureLogin( function () {
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
          });
        };
      },
      templateUrl: 'templates/directives/comments.html'
    };
  }
]);
