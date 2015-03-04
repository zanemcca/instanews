
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
      Article.subarticles({id: $stateParams.id})
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

   //TODO Move the filing in to the server and only transmit the content
   $scope.createComment = function( subarticle, content) {
      Subarticle.comments.create({
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
      });
   }

   $scope.upvoteComment = function(comment, subarticle) {
      Comment.prototype$upvote({id: comment.commentId})
      .$promise
      .then ( function (res) {
         comment._votes = res.comment._votes;
      });
   }

   $scope.downvoteComment = function(comment, subarticle) {
      Comment.prototype$downvote({id: comment.commentId})
      .$promise
      .then ( function (res) {
         comment._votes = res.comment._votes;
      });
   }

   $scope.upvote = function(subarticle, $index) {
      Subarticle.prototype$upvote({id: subarticle.subarticleId})
      .$promise
      .then( function (res) {
         subarticle._votes = res.subarticle._votes;
      });
   }

   $scope.downvote = function(subarticle, $index) {
      Subarticle.prototype$downvote({id: subarticle.subarticleId})
      .$promise
      .then( function (res) {
         subarticle._votes = res.subarticle._votes;
      });
   }

   $scope.toggleComments = function(subarticle) {
      if(!subarticle.showComments) {
         Subarticle.comments({id: subarticle.subarticleId})
         .$promise
         .then( function (res) {
            subarticle.comments = res;
            subarticle.showComments = true;
         });
      }
      else {
         subarticle.showComments = false;
      }
   }
}]);

