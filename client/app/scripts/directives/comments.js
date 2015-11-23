'use strict';

var app = angular.module('instanews.directive.comments', ['ionic', 'ngResource']);

app.directive('incomments', [
  'Comment',
  'Subarticle',
  'TextInput',
  'Article',
  function (
    Comment,
    Subarticle,
    TextInput,
    Article
  ) {

    return {
      restrict: 'E',
      scope: {
        owner: '='
      }, 
      controller: function($scope) {

        var Models = {
          article: Article,
          comment: Comment,
          subarticle: Subarticle
        }; 

        $scope.create = function () {
          var textInput = TextInput.get();
          if($scope.owner.commentableId) {
            textInput.placeholder = 'Write a reply...';
          }

          textInput.open(function (text) {
            createComment(text);
          });
        };

        var createComment = function (content) {
          Comment.create({
            content: content,
            commentableId: $scope.owner.id,
            commentableType: $scope.owner.modelName
          }).$promise
          .then(function(res,err) {
            // istanbul ignore if 
            if(err) {
              console.log(err);
            }
            else {
              $scope.owner.comments.push(res);
            }
          });
        };

        var itemsAvailable = false;
        //TODO Use comments as the list service name
        $scope.comments = {
          areItemsAvailable: function () {
            return itemsAvailable;
          }
        };

        $scope.owner.comments = $scope.owner.comments || [];

        var order = 'rating DESC';
        if ( $scope.owner.commentableId ) {
          order = 'date DESC';
        }

        var spec = {
          options :{
            id: $scope.owner.id,
            filter: {
              limit: 10,
              skip: 0,
              order: order
            }
          }
        };

        $scope.$watch('owner.showComments', function (newVal, oldVal) {
          if(newVal && !oldVal) {
            $scope.loadMore();
          }
        });

        //TODO MOve comments over to the list service. Similar to subarticles and articles
        $scope.loadMore = function() {
          spec.options.filter.skip = $scope.owner.comments.length;
          // istanbul ignore else 
          if(Models.hasOwnProperty($scope.owner.modelName)) {
            Models[$scope.owner.modelName].comments(spec.options).$promise
            .then( function (comments) {
              if(comments.length < spec.options.filter.limit) {
                itemsAvailable = false;
              } else {
                itemsAvailable = true;
              }

              //Remove duplicates
              for( var i = 0; i < comments.length; i++) {
                for( var j = 0; j < $scope.owner.comments.length; j++) {
                  var comment = $scope.owner.comments[j];
                  if( comment.id === comments[i].id) {
                    comments.splice(i,1);
                    break;
                  }
                }
              }
              //Concatinate the new comments
              $scope.owner.comments = $scope.owner.comments.concat(comments);
              //TODO Ensure the comments are in their proper order
            });
          }
          else {
            console.log('Warning: Unknown commentableType!');
          }
        };
      },
      templateUrl: 'templates/directives/comments.html'
    };
  }]);
