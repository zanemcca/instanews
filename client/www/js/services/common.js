
var app = angular.module('instanews.common', ['ionic', 'ngResource']);

app.service('Common', ['Article', function(Article){

   var articles = Article.find();

   var upvote = function (Model, instance) {
      Model.prototype$upvote({id: instance.myId})
      .$promise
      .then( function (res) {
         instance._votes = res.instance._votes;
      });
   }

   var downvote = function (Model, instance) {
      Model.prototype$downvote({id: instance.myId})
      .$promise
      .then( function (res) {
         instance._votes = res.instance._votes;
      });
   }

   var newId = function() {
      var ret = Math.floor(Math.random()*Math.pow(2,32));
      return ret;
   }

   var createComment = function (Model, instance,instanceType, content) {
      Model.comments.create({
         id: instance.myId,
         content: content,
         commentableId: instance.myId,
         commentableType: instanceType
      })
      .$promise
      .then( function(res, err) {
         instance.comments.push(res);
      });
   }

   var toggleComments = function(Model, instance) {
      if(!instance.showComments) {
         Model.prototype$__get__comments({id: instance.myId})
         .$promise
         .then( function (res) {
            instance.comments = res;
            instance.showComments = true;
         });
      }
      else {
         instance.showComments = false;
      }
   }

   return {
      articles: articles,
      createComment: createComment,
      toggleComments: toggleComments,
      downvote: downvote,
      upvote: upvote
   };
}]);
