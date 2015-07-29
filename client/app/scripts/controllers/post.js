
'use strict';
var app = angular.module('instanews.post', ['ionic', 'ngResource', 'uuid']);

app.controller('PostCtrl', [
      '$stateParams',
      '$scope',
      '$ionicModal',
      '$ionicHistory',
      'Article',
      'Articles',
      'Post',
      'Platform',
      'Maps',
      'User',
      'Camera',
      function(
        $stateParams,
        $scope,
        $ionicModal,
        $ionicHistory,
        Article,
        Articles,
        Post,
        Platform,
        Maps,
        User,
        Camera
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
      $scope.newArticle = Post.saveParentId($stateParams.id);
    }
    else {
     $scope.newArticle = Post.getArticle();
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

   $scope.goBack = function() {
      Platform.showSheet({
        buttons: [
          { text:'<b>Save</b>' }
        ],
        destructiveText: 'Delete',
        titleText: 'What would you like done with your unpublished content?',
        cancelText: 'Cancel',
        cancel:  function() {},
        buttonClicked: function() {
          $ionicHistory.goBack();
        },
        destructiveButtonClicked: function() {
          Post.deleteArticle($scope.newArticle);
          $ionicHistory.goBack();
        }
      });
   };

   var exit = function() {
      if( Post.isPosting() ) {
        Platform.showToast('We\'ll let you know when your content is uploaded');
      }
      $ionicHistory.goBack();
   };

   //Post the new article to the server and also post any subarticles that may be
   //attached to it
   $scope.postArticle = function() {

      var marker = Maps.getMarker();
      if(marker && $scope.newArticle.tempId) {
         var position = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
         };

         Post.savePosition(position, $scope.newArticle.tempId);
         Post.saveTitle($scope.newArticle.title, $scope.newArticle.tempId);
         Post.post($scope.newArticle.tempId);
         exit();
      }
      else {
         console.log('Error: Cannot post article without both position and subarticles');
      }
   };

   /* Subarticle posting */

   //Wrapper for easy calling from view
   $scope.postSubarticle = function() {
      Post.post($scope.newArticle.tempId);
      exit();
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
      $scope.newArticle = Post.saveText($scope.data.text, $scope.newArticle.tempId);
      $scope.trashText();
   };


   /* Video posting */
   //Capture video using the video camera
   $scope.captureVideo = function() {
      Camera.getVideo()
      .then( function(videos) {
        $scope.newArticle = Post.saveVideos(videos, $scope.newArticle.tempId);
      }, function(err) {
         console.log(err);
      });
   };

   /* Photo posting */

   //Get a photo(s) from the gallery
   $scope.getPhotos = function() {
     Camera.getPictures( function(photos) {
       $scope.newArticle = Post.savePhotos(photos, $scope.newArticle.tempId);
     });
   };

   //Capture a photo using the camera and store it into the new article
   $scope.capturePhoto = function() {
      Camera.getPicture()
      .then( function(photo) {
        $scope.newArticle = Post.savePhotos(photo, $scope.newArticle.tempId);
      }, function(err) {
         console.log('Error: Failed to capture a new photo: ' + JSON.stringify(err));
      });
   };
}]);
