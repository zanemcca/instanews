'use strict';

var app = angular.module('instanews.directive.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
  '$timeout',
  'Comment',
  'Comments',
  'Navigate',
  'Platform',
  'TextInput',
  function (
    $timeout,
    Comment,
    Comments,
    Navigate,
    Platform,
    TextInput
  ) {

    return {
      restrict: 'E',
      scope: {
        owner: '='
      }, 
      controller: function($scope) {

        $scope.Platform = Platform;

        $scope.Comments = Comments.findOrCreate($scope.owner.modelName, $scope.owner.id).getLoader({
          keepSync: true
        });

        $scope.$watch('owner.showComments', function (newVal, oldVal) {
          if( newVal && !oldVal) {
            $scope.Comments.reload();
          }
        });

        var newComment = '';

        var scrollSpec = {
          scrollHandle: 'feed'
        };

        var Scroll = Navigate.scroll(scrollSpec);

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
                  $scope.owner.createCommentCount++;
                  $scope.Comments.reload();
                }
              });
            }, function (partialText) {
              //Interruption function
              newComment = partialText;
            });

            // Wait a frame
            $timeout(function () {
              Scroll.anchorScroll($scope.owner.id);
            }, 16);
          });
        };
      },
      templateUrl: 'templates/directives/comments.html'
    };
  }
]);
