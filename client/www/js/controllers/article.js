
var app = angular.module('instanews.article', ['ionic', 'ngResource']);


app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      'Article',
      'Subarticle',
      'Comment',
      'Common',
      'Camera',
      'Storage',
      function($scope, $stateParams, Article, Subarticle, Comment, Common, Camera, Storage) {

   $scope.subarticles = [];
   $scope.article = Common.getArticle($stateParams.id);

   getSubarticles = function(cb) {
      Article.subarticles({id: $stateParams.id})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
         if (cb) cb();
      })
   }

   getSubarticles();

   $scope.onRefresh = function () {
      getSubarticles( function () {
         $scope.$broadcast('scroll.refreshComplete');
      });
   }

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

   $scope.postText = function() {
      Article.subarticles.create({
         id: $stateParams.id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: $stateParams.id,
         _votes: {
            up: Math.floor(Math.random()*100),
            down: Math.floor(Math.random()*50),
            lastUpdated: Date.now()
         },
         username: 'bob',
         text: 'Key: ' +  Math.random().toString()
      })
      .$promise.then( function(res) {
         $scope.subarticles.push(res);
      });
   };



   $scope.postPhoto = function() {

      Camera.getPicture()
      .then( function(imageURI) {
         console.log(imageURI);

         Article.subarticles.create({
            id: $stateParams.id,
            date: Date.now(),
            myId: Math.floor(Math.random()*Math.pow(2,32)),
            parentId: $stateParams.id,
            _votes: {
               up: 0,
               down: 0,
               lastUpdated: Date.now()
            },
            username: 'bob',
            text: imageURI
         })
         .$promise.then( function(res) {
            $scope.subarticles.push(res);
         });
      }, function(err) {
         console.err(err);
      });
   };

   $scope.createComment = function( subarticle, content) {
      Common.createComment(Subarticle, subarticle,'subarticle', content);
   };

   $scope.upvoteComment = function(comment) {
      Common.upvote(Comment, comment);
   };

   $scope.downvoteComment = function(comment) {
      Common.downvote(Comment, comment);
   };

   $scope.upvote = function(subarticle) {
      Common.upvote(Subarticle,subarticle);
   };

   $scope.downvote = function(subarticle) {
      Common.downvote(Subarticle,subarticle);
   };

   $scope.toggleComments = function(subarticle) {
      Common.toggleComments(Subarticle,subarticle);
   };
}]);

