'use strict';
var app = angular.module('instanews.controller.post', ['ionic', 'ngResource', 'uuid']);

app.controller('PostCtrl', [
  '$scope',
  '$timeout',
  '$ionicModal',
  'Navigate',
  'Article',
  'Articles',
  'Post',
  'Platform',
  'Maps',
  'User',
  'Uploads',
  function(
    $scope,
    $timeout,
    $ionicModal,
    Navigate,
    Article,
    Articles,
    Post,
    Platform,
    Maps,
    User,
    Uploads
  ) {

    $scope.user = User.get();
    $scope.getMarker = Maps.getMarker;
    $scope.Platform = Platform;

    var updateUser = function() {
      $scope.user = User.get();
    };
    User.registerObserver(updateUser);

    $scope.$watch('newArticle.title', function (newTitle, oldTitle) {
      if(newTitle !== oldTitle) {
        if(newTitle && newTitle.length > 0) {
          // jshint undef: false
          $scope.title = Case.title(newTitle);
        } else {
          $scope.title = '';
        }
      }
    });

    $scope.place = Maps.getNewPlace(); 
    $scope.place.post = true;
    $scope.newArticle = Post.getNewArticle();

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.Uploads = Uploads.findOrCreate();
      $scope.newArticle = Post.getNewArticle();
      if(!$scope.newArticle.title) {
        $scope.newArticle.title = '';
      }

      // jshint undef: false
      $scope.title = Case.title($scope.newArticle.title);
      if($scope.newArticle.title === '' && $scope.Uploads.get().length === 0) {
        console.log('New post!');
        $scope.place.localize( { zoom: 18 }, function (pos) {
          if(pos) {
            Maps.setMarker($scope.place.getMap(), pos);
          }
        });
      }
    });

    $scope.$on('$ionicView.afterEnter', function() {
      var map = Maps.getPostMap();
      if(map) {
        google.maps.event.trigger(map, 'resize');
      }

      Platform.analytics.trackView('Post View');
    });

    $scope.$on('$ionicView.unloaded', function() {
      console.log('Deleting the post map');
      Maps.deletePostMap();
    });

    $scope.map = {
      id: 'postMap'
    };

     var geocoder = new google.maps.Geocoder();

     $scope.$watch(function (scope) {
       return scope.place.value;
     }, function (newValue, oldValue) {
       if(newValue !== oldValue) {

         var centerMap = function (place) {
           var map = Maps.getPostMap();
           if(place.geometry.viewport) {
             Maps.fitBounds(map, place.geometry.viewport);
           }
           else {
             Maps.setCenter(map, place.geometry.location);
           }

           Maps.setMarker(map, place.geometry.location);
         };

         console.log('New place!');
         console.log(newValue);

         if(newValue.geometry) {
           centerMap(newValue);
         } else {
           geocoder.geocode({'address': newValue.description}, function(results, status) {
             if (status === google.maps.GeocoderStatus.OK) {
               centerMap(results[0]);
             } else {
               console.log('Geocode was not successful for the following reason: ' + status);
             }
           }); 
         }
       }
     });

     //TODO Either use this everytime or not at all
     //TODO DEPRICATE this. Use an always save policy
    $scope.goBack = function() {
      Platform.showSheet({
        destructiveText: 'Delete',
        titleText: 'Your unpublished content will be lost if you continue!',
        cancelText: 'Cancel',
        cancel:  function() {},
        buttonClicked: function() {
          Navigate.goBack();
        },
        destructiveButtonClicked: function() {
          console.log('post goback button was clicked');
          Navigate.goBack();
        }
      });
    };


    var exit = function() {
      if(Post.isPosting() && $scope.Uploads.hasMediaItems()) {
        Platform.showToast('We\'ll let you know when your content is uploaded');
      }

      Navigate.goBack();
      $timeout(function () {
        $scope.alreadyPosting = false;
      }, 1000);
    };

    $scope.alreadyPosting = false;

    $scope.post = function () {
      $scope.alreadyPosting = true;
      if($scope.Uploads.get().length) {
        var marker = Maps.getMarker();
        if(marker && $scope.newArticle.title) {
          Platform.loading.show();

          var position = {
            type: 'Point',
            coordinates: [ marker.getPosition().lng(), marker.getPosition().lat()]
          };

          var article = {
            isPrivate: false,
            loc: position,
            title: $scope.title
          };

          Post.post($scope.Uploads, article, function (err) {
            Platform.loading.hide();
            if(!err) {
              exit();
            } else {
              $scope.alreadyPosting = false;
              if(!err.noAlert) {
                Platform.showAlert('Something went wrong while posting your content. Please try again');
              }
            }
          });
        }
        else {
          $scope.alreadyPosting = false;
          console.log('Error: Cannot post article without both position and title');
        }
      } else {
        $scope.alreadyPosting = false;
        console.log('Cannot post without subarticles');
      }
    };
  }
]);
