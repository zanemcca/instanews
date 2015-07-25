
'use strict';
var app = angular.module('instanews.post', ['ionic', 'ngResource', 'uuid']);

app.controller('PostCtrl', [
      '$stateParams',
      '$scope',
      '$ionicModal',
      '$ionicHistory',
      'Article',
      'Articles',
      'Maps',
      'User',
      'Camera',
      'ENV',
      'FileTransfer',
      function(
        $stateParams,
        $scope,
        $ionicModal,
        $ionicHistory,
        Article,
        Articles,
        Maps,
        User,
        Camera,
        ENV,
        FileTransfer
      ) {

   $scope.user = User.get();
   $scope.getMarker = Maps.getMarker;

   var updateUser = function() {
      $scope.user = User.get();
   };

   User.registerObserver(updateUser);

    //If we have an ID given then we know we are posting subarticles within an article
    if( $stateParams.id ) {
      $scope.article = Articles.getOne($stateParams.id);
    }
    else {
      //Refresh the map everytime we enter the view
      $scope.$on('$ionicView.afterEnter', function() {
        $scope.localize();
      });
    }

   $scope.localize = function() {
     var map = Maps.getPostMap();
      if( map) {
         Maps.localize(map, function(err, pos) {
            if(err) {
               console.log('Error: ' + err);
            }
            else {
               Maps.setMarker(map,pos);
            }
         });
      }
      else {
         console.log('Map not valid! Cannot localize!');
      }
   };

   $scope.data = {
      text: '',
   };

   $scope.newArticle = {
      title: '',
      data: []
   };

   $scope.trashArticle = function() {
      $scope.newArticle.title = '';
      $scope.newArticle.data = [];
      $ionicHistory.goBack();
   };

   //Post the new article to the server and also post any subarticles that may be
   //attached to it
   $scope.postArticle = function() {

      var marker = Maps.getMarker();
      if(marker) {
         var position = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
         };

         Article.create({
            isPrivate: false,
            location: position,
            username: $scope.user.username,
            title: $scope.newArticle.title
         })
         .$promise
         .then( function(res) {
            if( $scope.newArticle.data.length > 0 ){
               postSubarticle(res.id, function(res) {
                  console.log('Succesful sub creation: ' + JSON.stringify(res));
                  $scope.trashArticle();
               });
            }
            else {
              $scope.trashArticle();
            }
         }, function(err) {
            console.log('Error posting article: ' + err);
         }); 
      }
      else {
         console.log('Cannot post article without position');
      }
   };

   /* Subarticle posting */

   //Clean up the subarticle and go back to the article view
   $scope.trashSubarticle = function() {
      $scope.data.text = '';
      $ionicHistory.goBack();
   };

   //Wrapper for easy calling from view
   $scope.postSubarticle = function() {
      postSubarticle($stateParams.id, function(res) {
         console.log('Posted a subarticle: ' + res);
         $scope.trashSubarticle();
      });
   };

   //Determine the type of subarticle the data is posting and then
   // call the appropriate posting function
   var postSubarticle = function(id, cb) {
      var datas = $scope.newArticle.data;

      if(datas.length > 0) {
        var handle = function(res) {
           subs.push(res);
           if( subs.length === datas.length) {
              cb(subs);
           }
        };

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
           func(id,data, handle);
        }
      }
      else {
        console.log('Warning: There was no data given for subarticle creation');
        cb();
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
         parentId: id,
         username: $scope.user.username,
         text: data.text
      })
      .$promise.then(cb);
   };


   /* Video posting */
   //Capture video using the video camera
   $scope.captureVideo = function() {
      Camera.getVideo()
      .then( function(video) {
         $scope.newArticle.data.push({
            videos: video
         });
      }, function(err) {
         console.log(err);
      });
   };

   var progress = function (progress) {
         //console.log('Progress: ' + JSON.stringify(progress));
   };

   //Post video to the server within a specified article
   var postVideo = function(id, data, cb) {
      var subs = [];

      var handle = function (res) {
         subs.push(res);
         if ( subs.length === data.videos.length) {
            cb(subs);
         }
      };

      var container = 'instanews.videos.us.east';
      var server = ENV.apiEndpoint + '/storages/' + container + '/upload';

     var onVideoUploadSuccess = function(res) {
       console.log('Succesful upload of video!');

       options.fileName = poster; 
       options.mimeType = 'image/jpeg'; 

       FileTransfer.upload(server, video.thumbnailURI, options)
       .then( function(res) {
         console.log('Succesful upload of thumbnail!');
         //console.log('Res: ' + JSON.stringify(res));
         Article.subarticles.create({
            id: id,
            parentId: id,
            username: $scope.user.username,
            _file: {
               type: video.type,
               container: container,
               name: video.name,
               size: video.size,
               poster: poster,
               lastModified: video.lastModified,
               caption: video.caption
            }
         })
         .$promise.then(handle);
       }, function(err) {
         console.log('Error: Failed to upload thumbnail: ' + JSON.stringify(err));
       }, progress);
     };

     var error = function(err) {
       //TODO Notify the user and retry
       console.log('Error: Failed to upload a video: ' + JSON.stringify(err));
     };

      for( var i = 0; i < data.videos.length; i++) {
         var video = data.videos[i];

         var options = {
           fileName: video.name,
           mimeType: video.type,
           headers: { 'Authorization': User.getToken()}
         };

         var poster = video.name.slice(0,video.name.lastIndexOf('.') + 1) + 'jpg';

         FileTransfer.upload(server, video.nativeURL, options)
         .then( onVideoUploadSuccess, error, progress);
      }
   };

   /* Photo posting */

   //Get a photo(s) from the gallery
   $scope.getPhotos = function() {

     Camera.getPictures( function(images) {
       $scope.newArticle.data.push({
          images: images
       });
     });
   };

   //Capture a photo using the camera and store it into the new article
   $scope.capturePhoto = function() {
      Camera.getPicture()
      .then( function(file) {
         $scope.newArticle.data.push({
            images: [file] 
         });
      }, function(err) {
         console.log('Error: Failed to capture a new photo: ' + JSON.stringify(err));
      });
   };

   //Post a photo to the server under a specific article
   var postPhoto = function(id, data, cb) {
      var subs = [];

      var handle = function (res) {
         subs.push(res);
         if ( subs.length === data.images.length) {
            cb(subs);
         }
      };

     var onPhotoUploadSuccess = function(res) {
       //Success Callback
       console.log('Successful image upload: ' + res);
       Article.subarticles.create(subarticle)
       .$promise.then(handle);
     };
     var error = function(err) {
        console.log('Error: Failed to upload a photo!: ' + err);
     };

      for( var i = 0; i < data.images.length; i++) {
         var file = data.images[i];

         var subarticle = {
            id: id,
            parentId: id,
            username: $scope.user.username,
            _file: {
               type: file.type,
               name: file.name,
               size: file.size,
               lastModified: file.lastModified,
               caption: file.caption
            }
         };

         var container = 'instanews.photos.us.east';

         var server = ENV.apiEndpoint + '/storages/' + container + '/upload';

         var options = {
           fileName: file.name,
           mimeType: file.type,
           headers: { 'Authorization': User.getToken()}
         };

         FileTransfer.upload(server, file.nativeURL, options)
         .then( onPhotoUploadSuccess, error, progress);
      }
   };

}]);
