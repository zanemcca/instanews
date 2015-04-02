var app = angular.module('instanews.post', ['ionic', 'ngResource','ngAutocomplete']);

app.controller('PostCtrl', [
      '$state',
      '$stateParams',
      '$scope',
      '$ionicModal',
      '$location',
      'Article',
      'Common',
      'Camera',
      function($state,
         $stateParams,
         $scope,
         $ionicModal,
         $location,
         Article,
         Common,
         Camera) {

   $scope.user = Common.user.user;

   if( $stateParams.id ) {
      $scope.article = Common.getArticle($stateParams.id);
   }

   $scope.useMyLocation = function() {
      //TODO Change this to lookup the name of the user location
      $scope.newArticle.search = 'My Location';
   };

   $scope.data = {
      text: '',
      images: [],
      videos: []
   };

   $scope.newArticle = {
      title: '',
      search: '',
      data: []
   };

   $scope.trashArticle = function() {
      $scope.newArticle.title = '';
      $scope.newArticle.data = [];
      $scope.newArticle.serch = '';
      $location.path('/feed');
   };

   //Post the new article to the server and also post any subarticles that may be
   //attached to it
   $scope.postArticle = function() {
      if ($scope.newArticle.search ) {
         //TODO Lookup the lat-lng
         $scope.newArticle.search = 'My Location';
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      else {
         $scope.newArticle.search = 'My Location';
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      Article.create({
         date: Date.now(),
         isPrivate: false,
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         location: loc,
         username: $scope.user.username,
         title: $scope.newArticle.title
      })
      .$promise.then( function(res) {
         if( $scope.newArticle.data.length > 0 ){
            postSubarticle(res.myId, function(res) {
               console.log('Succesful sub creation');
            });
         }
         $scope.trashArticle();
      });
   };

   /* Subarticle posting */

   //Clean up the subarticle and go back to the article view
   $scope.trashSubarticle = function() {
      $scope.data.text = '';
      $scope.images = [];
      $scope.videos = [];
      $location.path('/articles/' + $stateParams.id);
   };

   //Wrapper for easy calling from view
   $scope.postSubarticle = function() {
      postSubarticle($stateParams.id, function(res) {
         $scope.trashSubarticle();
      });
   }

   //Determine the type of subarticle the data is posting and then
   // call the appropriate posting function
   var postSubarticle = function(id, cb) {
      var datas = $scope.newArticle.data;

      var subs = [];
      for( var i = 0; i < datas.length; i++) {
         var data = datas[i];
         var func;
         if( data.text ) {
            func = postText;
         }
         else if ( data.videos && data.videos.length > 0 ) {
            func = postVideo;
         }
         else {
            func = postPhoto;
         }
         func(id,data, function(res) {
            subs.push(res);
            if( subs.length === datas.length) {
               cb(subs);
            }
         });
      }
   };

   /* Text Posting */

   //Modal for posting text
   $ionicModal.fromTemplateUrl('templates/postTextModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.postTextModal = modal;
   });

   //Clean up the temp text value and hide the modal
   $scope.trashText = function() {
      $scope.data.text = '';
      $scope.postTextModal.hide();
   };

   //Move the text out of the form so that it is ready to be submitted
   $scope.saveText = function() {
      $scope.newArticle.data.push({
         text: $scope.data.text
      });
      $scope.trashText();
   };

   //Post text to the server under a specific article
   var postText = function(id, data, cb) {
      Article.subarticles.create({
         id: id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: id,
         username: $scope.user.username,
         text: data.text
      })
      .$promise.then(cb);
   };


   /* Video posting */

   //Clean up the video temp files
   $scope.trashVideo = function() {
      $scope.data.videos = [];
   }

   //Capture video using the video camera
   $scope.captureVideo = function() {
      Camera.getVideo()
      .then( function(video) {
         $scope.newArticle.data.push({
            videos: video
         });
         $scope.trashVideo();
      }, function(err) {
         console.err(err);
      });
   };

   //Post video to the server within a specified article
   var postVideo = function(id, data, cb) {
      var subs = [];

      for( var i = 0; i < data.videos.length; i++) {
         var video = data.videos[i];
         Article.subarticles.create({
            id: id,
            date: Date.now(),
            myId: Math.floor(Math.random()*Math.pow(2,32)),
            parentId: id,
            username: $scope.user.username,
            _file: {
               type: video.type,
               name: video.fullPath, //TODO load to media service then change this to filename
               size: video.size,
               poster: video.poster,
               caption: video.caption
            }
         })
         .$promise.then( function (res) {
            subs.push(res);
            if ( subs.length === data.videos.length) {
               cb(subs);
            }
         });
      }
   }

   /*
   $scope.captureThumbnail = function() {
      Camera.getPicture()
      .then( function(imageURI) {
         $scope.data.imageURI = imageURI;
      }, function(err) {
         console.log(err);
      });
   };
   */



   /* Photo posting */

   //Delete the temporary photos so that the form is empty
   $scope.trashPhoto = function() {
      $scope.data.images = [];
   }

   //Get a photo(s) from the gallery
   $scope.getPhotos = function() {
      window.imagePicker.getPictures( function(res) {
         for ( var i = 0; i < res.length; i++) {
            //console.log('ImageURI: ' + res[i]);
            var image = {
               URI: res[i],
               caption: ''
            };
            $scope.data.images.push(image);
         }
         $scope.newArticle.data.push({
            images: $scope.data.images
         });
         $scope.trashPhoto();
         $state.go($state.current, {}, {reload: true});
      }, function(err) {
         console.log('Error: ', err);
      });
   };

   //Capture a photo using the camera and store it into the new article
   $scope.capturePhoto = function() {
      Camera.getPicture()
      .then( function(imageURI) {
         var image = {
            URI: imageURI,
            caption: ''
         };

         $scope.data.images.push(image);
         $scope.newArticle.data.push({
            images: $scope.data.images
         });
         $scope.trashPhoto();
      }, function(err) {
         console.log(err);
      });
   };

   //Post a photo to the server under a specific article
   var postPhoto = function(id, data, cb) {
      var subs = [];

      for( var i = 0; i < data.images.length; i++) {
         var image = data.images[i];

         var subarticle = {
            id: id,
            parentId: id,
            date: Date.now(),
            username: $scope.user.username,
            myId: Math.floor(Math.random()*Math.pow(2,32)),
            _file: {
               type: 'image',
               name: image.URI,
               size: 5000,
               caption: image.caption
            }
         }
         Article.subarticles.create(subarticle)
         .$promise.then( function (res) {
            subs.push(res);
            if ( subs.length === data.images.length) {
               cb(subs);
            }
         });
      }
   };

}]);
