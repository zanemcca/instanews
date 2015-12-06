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
  'Uploads',
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
    Uploads
  ) {

    $scope.user = User.get();
    $scope.getMarker = Maps.getMarker;

    $scope.Uploads = Uploads.findOrCreate();

    var updateUser = function() {
      $scope.user = User.get();
    };

    User.registerObserver(updateUser);

    $scope.$watch('newArticle.title', function (newTitle, oldTitle) {
      if(newTitle !== oldTitle) {
        if(newTitle && newTitle.length > 0) {
          // jshint undef: false
          $scope.newArticle.title = Case.title(newTitle);
        }
      }
    });

    $scope.place = {
      getMap: Maps.getPostMap,
      ignore: ['country', 'administrative_area_level_1'],
      localizeCallback: function (err, pos) {
        if(err) {
          console.log('Error: ' + err);
        }
        else {
          Maps.setMarker(Maps.getPostMap(), pos);
        }
      },
      localize: function () {}    // localize is filled in by the autocomplete directive
    };

    $scope.newArticle = {
      title: ''
    };

    var pendingPost = false;

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      if(!pendingPost) {
        pendingPost = true;
        $scope.place.localize();
      }
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
          $ionicHistory.goBack();
        },
        destructiveButtonClicked: function() {
          console.log('post goback button was clicked');
          //$scope.Upload.destroy(Uploads);
          $ionicHistory.goBack();
        }
      });
    };

    var exit = function() {
      if( Post.isPosting() ) {
        Platform.showToast('We\'ll let you know when your content is uploaded');
      }

      $scope.newArticle = {
        title: ''
      };

      $ionicHistory.goBack();
    };

    $scope.post = function () {
      if($scope.Uploads.get().length) {
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

            Post.post($scope.Uploads, article, function (err) {
              if(!err) {
                pendingPost = false;
                exit();
              }
            });
          }
          else {
            console.log('Error: Cannot post article without both position and title');
          }
      } else {
        console.log('Cannot post without subarticles');
      }
    };
  }
]);
