
var app = angular.module('instanews.article', ['ionic', 'ngResource']);


app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Subarticle',
      'Comment',
      function($scope, $stateParams, Article, Subarticle, Comment) {

   $scope.subarticles = [];

   function getSubarticles() {
      Article.prototype$__get__subarticles({id: $stateParams.id})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
      });
   }

   getSubarticles();

   $scope.getSubarticleHeight = function(subarticle) {
      var height;
      if (subarticle._file) {
         //Video and image size
         if (subarticle._file.type === 'video') {
            height = 360;
            //console.log('Video: '+ height);
         }
         else if (subarticle._file.type === 'image') {
            height = 480;
            //console.log('Image: '+ height);
         }
      }
      else {
         //Size of text
         height = 50;
         //console.log('Text: '+ height);
      }
      return height;
   }

   var newId = function() {
      var ret = Math.floor(Math.random()*Math.pow(2,32));
      return ret;
   }

   var updateSubarticle = function (subarticle) {
      $scope.subarticles.splice($scope.subarticles.indexOf(subarticle),1,subarticle);
   }

   $scope.createComment = function( subarticle, content) {
      Subarticle.prototype$__create__comments({
         id: subarticle.subarticleId,
         content: content,
         username: "bob",
         date:  Date.now(),
         commentableId: subarticle.subarticleId,
         commentableType: "subarticle",
         commentId: newId(),
         _votes: {
            up: 0,
            down: 0,
            lastUpdated: Date.now()
         }
      })
      .$promise
      .then( function(res, err) {
         subarticle.comments.push(res);
         updateSubarticle(subarticle);
      });
   }

   $scope.upvoteComment = function(comment, subarticle) {
      Comment.prototype$upvote({id: comment.commentId})
      .$promise
      .then ( function (res) {
         subarticle.comments.splice(subarticle.comments.indexOf(comment),1,res.comment);
         updateSubarticle(subarticle);
      });
   }

   $scope.downvoteComment = function(comment, subarticle) {
      Comment.prototype$downvote({id: comment.commentId})
      .$promise
      .then ( function (res) {
         subarticle.comments.splice(subarticle.comments.indexOf(comment),1,res.comment);
         updateSubarticle(subarticle);
      });
   }

   $scope.upvote = function(subarticle, $index) {
      Subarticle.prototype$upvote({id: subarticle.subarticleId})
      .$promise
      .then( function (res) {
         subarticle._votes = res.subarticle._votes;
         updateSubarticle(subarticle);
      });
   }

   $scope.downvote = function(subarticle, $index) {
      Subarticle.prototype$downvote({id: subarticle.subarticleId})
      .$promise
      .then( function (res) {
         subarticle._votes = res.subarticle._votes;
         updateSubarticle(subarticle);
      });
   }

   $scope.toggleComments = function(subarticle) {
      if(!subarticle.showComments) {
         Subarticle.prototype$__get__comments({id: subarticle.subarticleId})
         .$promise
         .then( function (res) {
            subarticle.comments = res;
            subarticle.showComments = true;
            updateSubarticle(subarticle);
         });
      }
      else {
         subarticle.showComments = false;
         updateSubarticle(subarticle);
      }
   }
}]);

