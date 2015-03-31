var app = angular.module('instanews.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
      '$scope',
      '$stateParams',
      '$ionicPopover',
      '$ionicModal',
      '$filter',
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
         $filter,
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
      text: '',
      caption: '',
      video: {},
      imageURI: ''
   };

   var lastUpdate = new Date(1975,1);

   var loadLimit = 3;

   var filter = {
      limit: loadLimit,
      skip: 0,
      order: 'rating DESC'/*,
      where: {
         date: {gt: lastUpdate}
      }*/
   }

   var getSubarticles = function(cb) {

      filter.skip = 0;
 //     lastUpdate = new Date(1975,1);
 //     filter.where.date.gt = lastUpdate;
      Article.subarticles({id: $stateParams.id, filter: filter})
      .$promise
      .then( function (res) {
         $scope.subarticles = res;
         $scope.itemsAvailable = true;
         if (cb) cb();
      });
   };

   getSubarticles();

   //TODO Only load modified or new subarticles
   //    not all of them. I think server side session
   //    management is the key
   $scope.loadMore = function () {
      filter.limit = $scope.subarticles.length + loadLimit;
      //TODO Dynamic loadLimit based on scroll speed & ping time

      Article.subarticles.count({id: $stateParams.id})
      .$promise
      .then ( function (res) {

         var count = res.count;

         Article.subarticles({
            id: $stateParams.id,
            filter: filter
         })
         .$promise
         .then( function (res) {
            if (res.length === count) {
               console.log('No more items');
               $scope.itemsAvailable = false;
            }
            for(var j = 0; j < res.length; j++) {
               item = res[j];
               var update = false;
               for(var i = 0; i < $scope.subarticles.length; i++ ) {
                  var sub = $scope.subarticles[i];
                  if( sub.myId === item.myId) {
                     update = true;
                     if ( Date.parse(sub.date) < Date.parse(item.date)) {
                        //Only update the votes for now so that media doesn't
                        //have to reload
                        sub._votes = item._votes;
                        sub.date = item.date;

                        console.log('Updated: ' + item.text);
                        console.log('@ ' + item.date);
                        if ( item._file) {
                           console.log(item._file.name);
                        }
                     }
                     break;
                  }
               }
               if(!update) {
                  $scope.subarticles.push(item);
               }

               /*
               //Set our last update as the latest updated article we recieve back
               //This makes sure there is no possibility of forming gaps .
               var tempDate = Date.parse(item._votes.lastUpdated);
               if ( lastUpdate < tempDate) {
                  console.log('lastUpdate: ' + lastUpdate + '\tRemote: ' + tempDate);
                  lastUpdate = tempDate;
                 // filter.where.date.gt = lastUpdate;
               }
               */
            }
         });
      });

      $scope.$broadcast('scroll.infiniteScrollComplete');
   };

   $scope.onRefresh = function () {
      getSubarticles( function () {
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   $ionicModal.fromTemplateUrl('templates/videoPostModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.videoPostModal = modal;
   });

   $ionicModal.fromTemplateUrl('templates/photoPostModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.photoPostModal = modal;
   });

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

   $scope.trashPhoto = function() {
      $scope.data.imageURI = '';
      $scope.data.caption = '';
      $scope.photoPostModal.hide();
   }

   $scope.trashVideo = function() {
      $scope.data.video = {};
      $scope.data.caption = '';
      $scope.data.imageURI = '';
      $scope.videoPostModal.hide();
   }

   $scope.postText = function() {
      Article.subarticles.create({
         id: $stateParams.id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: $stateParams.id,
         username: $scope.user.username,
         text: $scope.data.text
      })
      .$promise.then( function(res) {
         $scope.subarticles.push(res);
      });
      $scope.trashText();
   };

   $scope.postPhoto = function() {
      Article.subarticles.create({
         id: $stateParams.id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: $stateParams.id,
         username: $scope.user.username,
         _file: {
            type: 'image',
            name: $scope.data.imageURI,
            size: 5000,
            caption: $scope.data.caption
         }
      })
      .$promise.then( function(res) {
         $scope.subarticles.push(res);
         $scope.trashPhoto();
      });
   }

   $scope.capturePhoto = function() {
      Camera.getPicture()
      .then( function(imageURI) {
         console.log(imageURI);
         $scope.data.imageURI = imageURI;
         $scope.photoPostModal.show();
      }, function(err) {
         console.err(err);
      });
   };

   $scope.postVideo = function() {
      var video = $scope.data.video;
      Article.subarticles.create({
         id: $stateParams.id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: $stateParams.id,
         username: $scope.user.username,
         _file: {
            type: video.type,
            name: video.fullPath, //TODO load to media service then change this to filename
            size: video.size,
            poster: $scope.data.imageURI,
            caption: $scope.data.caption
         }
      })
      .$promise.then( function(res) {
         $scope.subarticles.push(res);
         $scope.trashVideo();
      });
   }

   $scope.captureThumbnail = function() {
      Camera.getPicture()
      .then( function(imageURI) {
         $scope.data.imageURI = imageURI;
      }, function(err) {
         console.log(err);
      });
   };

   $scope.captureVideo = function() {
      Camera.getVideo()
      .then( function(video) {
         console.log(video);
         $scope.data.video = video[0];
         $scope.videoPostModal.show();
      }, function(err) {
         console.err(err);
      });
   };
}]);

