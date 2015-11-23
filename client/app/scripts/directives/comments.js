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
          TextInput.get().open(function (text) {
            createComment(text);
          });
        };

        var createComment = function (content) {
          var instance = $scope.owner;
          Comment.create({
            content: content,
            commentableId: instance.id,
            commentableType: instance.modelName
          }).$promise
          .then(function(res,err) {
            // istanbul ignore if 
            if(err) {
              console.log(err);
            }
            else {
              instance.comments.push(res);
            }
          });
        };

        //TODO MOve comments over to the list service. Similar to subarticles and articles
        $scope.loadMore = function(instance) {
          var order = 'rating DESC';
          if ( instance.commentableId ) {
            order = 'date DESC';
          }

          // istanbul ignore else 
          if(Models.hasOwnProperty(instance.modelName)) {
            Models[instance.modelName].comments({
              id: instance.id,
              filter: {
                limit: 10,
                skip: instance.comments.length,
                order: order
              }
            }).$promise
            .then( function (comments) {
              //Remove duplicates
              for( var i = 0; i < comments.length; i++) {
                for( var j = 0; j < instance.comments.length; j++) {
                  var comment = instance.comments[j];
                  if( comment.id === comments[i].id) {
                    comments.splice(i,1);
                    break;
                  }
                }
              }
              //Concatinate the new comments
              instance.comments = instance.comments.concat(comments);
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
