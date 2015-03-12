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
   $scope.user = Common.user.user;
   $scope.itemsAvailable = true;

   //Scope variables
   $scope.subarticles = [];
   $scope.article = Common.getArticle($stateParams.id);
   //Form entry structure
   $scope.data = {
      text: ''
   };

   var filter = {
      limit: 2,
      skip: 0,
      order: '_votes.rating DESC'
   }

   var getSubarticles = function(cb) {

      filter.skip = 0
      Article.subarticles({id: $stateParams.id, filter: filter})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
         $scope.itemsAvailable = true;
         if (cb) cb();
      });
   };

   getSubarticles();

   $scope.loadMore = function () {
      filter.skip += filter.limit;
      //TODO dynamic filter limit based on users speed

      var subarticlesCount;

      Article.subarticles.count({id : $stateParams.id})
      .$promise
      .then( function (res) {
         var count = res.count;

         if (count <= filter.skip + filter.limit ) {
            console.log('No more items');
            $scope.itemsAvailable = false;
         }

         Article.subarticles({
            id: $stateParams.id,
            filter: filter
         })
         .$promise
         .then( function (res) {
            //POSSIBLY DANGEROUS - NOT SURE ABOUT ORDERING WITH FOREACH
            //TODO Clean this up so that we are not getting duplicates
            //    from the server due to reordering
            angular.forEach(res, function(item) {
               $scope.subarticles.push(item);
            });
         });
      });

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

   //TODO move post creation to a service
   $scope.trashText = function() {
      $scope.data.text = '';
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
         username: $scope.user.username,
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
               rating: 0,
               lastUpdated: Date.now()
            },
            username: $scope.user.username,
            _file: {
               type: 'image',
               name: imageURI,
               size: 5000,
               caption: 'Look at that'
            }
         })
         .$promise.then( function(res) {
            $scope.subarticles.push(res);
         });
      }, function(err) {
         console.err(err);
      });
   };

}]);

