var app = angular.module('instanews.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      '$ionicPopover',
      '$ionicModal',
      'Article',
      'Subarticle',
      'Comment',
      'Common',
      'Camera',
      'Storage',
      function($scope,
         $stateParams,
         $ionicPopover,
         $ionicModal,
         Article,
         Subarticle,
         Comment,
         Common,
         Camera,
         Storage) {

   //Add the Models to the scope
   $scope.Subarticle = Subarticle;

   //Scope variables
   $scope.subarticles = [];
   $scope.article = Common.getArticle($stateParams.id);
   //Form entry structure
   $scope.data = {
      newText: ''
   };

   var getSubarticles = function(cb) {
      //TODO apply filters before hand
      Article.subarticles({id: $stateParams.id})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
         if (cb) cb();
      });
   };

   getSubarticles();

   $scope.loadMore = function () {
      $scope.$broadcast('scroll.infiniteScrollComplete');
   };

   $scope.onRefresh = function () {
      getSubarticles( function () {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   $ionicModal.fromTemplateUrl('templates/postTextModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.postTextModal = modal;
   });

   $ionicPopover.fromTemplateUrl('templates/postPopover.html', {
      scope: $scope,
   }).then (function (popover) {
      $scope.postPopover = popover;
   });

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
   };

   //TODO move post creation to a service
   $scope.trashText = function() {
      $scope.data.newtext = '';
      $scope.postTextModal.hide();
   };

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
         text: $scope.data.text
      })
      .$promise.then( function(res) {
         $scope.subarticles.push(res);
      });
      $scope.trashText();
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

}]);

