
'use strict';
var app = angular.module('instanews.controller.post', ['ionic', 'ngResource', 'uuid']);

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
  'Upload',
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
    Upload,
    Camera
  ) {

    $scope.user = User.get();
    $scope.getMarker = Maps.getMarker;
    $scope.uploads = [];

    var updateUser = function() {
      $scope.user = User.get();
    };

    User.registerObserver(updateUser);

    //If we have an ID given then we know we are posting subarticles within an article
    if( !$stateParams.id ) {
      $scope.newArticle = {
        title: ''
      };
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
        destructiveText: 'Delete',
        titleText: 'Your unpublished content will be lost if you continue!',
        cancelText: 'Cancel',
        cancel:  function() {},
        buttonClicked: function() {
          $ionicHistory.goBack();
        },
        destructiveButtonClicked: function() {
          Post.destroy($scope.uploads);
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

    $scope.post = function () {
      if($scope.uploads.length) {
        if(!$stateParams.id) {
          var marker = Maps.getMarker();
          if(marker && $scope.newArticle.title) {
            var position = {
              lat: marker.getPosition().lat(),
              lng: marker.getPosition().lng()
            };

            var article = {
              isPrivate: false,
              location: position,
              title: $scope.newArticle.title
            };

            Post.post($scope.uploads, article);
            exit();
          }
          else {
            console.log('Error: Cannot post article without both position and title');
          }

        } else {
          Post.post($scope.uploads, $stateParams.id);
          exit();
        }
      } else {
        console.log('Cannot post without subarticles');
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
      $scope.uploads.push(Upload.text($scope.data.text));
      $scope.trashText();
    };

    /* Video posting */
    //Capture video using the video camera
    $scope.captureVideo = function() {
      Camera.captureVideo()
      .then( function(video) {
        if(video) {
          $scope.uploads.push(Upload.video(video));
        }
      }, function(err) {
        console.log(err);
      });
    };

    /* Photo posting */

    //Get a photo(s) from the gallery
    $scope.openMediaGallery = function() {
      Camera.openMediaGallery()
      .then( function(media) {
        if(media) {
          console.log(media);
          //TODO Seperate out the video files
          var photo = media;
          $scope.uploads.push(Upload.picture(photo));
        }
      }, function(err) {
        console.log(err);
      });
    };

    //Capture a photo using the camera and store it into the new article
    $scope.capturePicture = function() {
      Camera.capturePicture()
      .then( function(photo) {
        if(photo) {
          $scope.uploads.push(Upload.picture(photo));
        }
      }, function(err) {
        console.log('Error: Failed to capture a new photo: ' + JSON.stringify(err));
      });
    };
  }]);
