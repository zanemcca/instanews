
'use strict';
var app = angular.module('instanews.post', ['ionic', 'ngResource','ngAutocomplete']);

app.controller('PostCtrl', [
      '$state',
      '$stateParams',
      '$scope',
      '$ionicModal',
      '$ionicHistory',
      'Article',
      'Articles',
      'Position',
      'Platform',
      'Maps',
      'User',
      'Camera',
      function($state,
         $stateParams,
         $scope,
         $ionicModal,
         $ionicHistory,
         Article,
         Articles,
         Position,
         Platform,
         Maps,
         User,
         Camera) {

   $scope.user = User.get();

   var updateUser = function() {
      $scope.user = User.get();
   };

   User.registerObserver(updateUser);

   var marker;
   var map;

   $scope.disableTap = function(){
      console.log('Disabling tap');
      var container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on('click', function(){
        document.getElementById('search-input').blur();
      });
   };

   Platform.ready
   .then( function() {
      //If we have an ID given then we know we are posting subarticles within an article
      if( $stateParams.id ) {
         $scope.article = Articles.getOne($stateParams.id);
      }
      else {
         //Refresh the map everytime we enter the view
         $scope.$on('$ionicView.afterEnter', function() {
            $scope.localize();
         });

         var element = document.getElementById('postMap');
         if ( element && element.textContent.indexOf('Map') === -1) {

            var position = Position.getLast();
            var mPosition = {};

            if(position && position.coords) {
               mPosition = Position.posToLatLng(position);
            }
            else {
               //Load Montreal for now
               mPosition = new google.maps.LatLng(45.5017 , -73.5673);
            }

            var mapOptions = {
               center: mPosition,
               zoom: 8,
               disableDefaultUI: true,
               mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = new google.maps.Map(element, mapOptions);

            var input = document.getElementById('search-input');
            var autocomplete = new google.maps.places.Autocomplete(input);

            //Add a listener on the search box
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
               var place = autocomplete.getPlace();

               if(!place.geometry) {
                  console.log('No geometry!');
                  return;
               }

               $scope.newArticle.place = place;

               if(place.geometry.viewport) {
                  map.fitBounds(place.geometry.viewport);
               }
               else {
                  Maps.setCenter(map, place.geometry.location);
                  map.setZoom(17);
               }

               if(!marker) {
                  Maps.setMarker(map, place.geometry.location);
                  $scope.newArticle.markerSet = true;
               }
               else {
                  marker.setPosition(place.geometry.location);
               }
            });

            google.maps.event.addListener(map, 'click', function(event) {
               if(!marker) {
                  Maps.setMarker(map, event.latLng);
                  $scope.newArticle.markerSet = true;
               }
               else {
                  marker.setPosition(event.latLng);
               }
            });

            Maps.setPostMap(map);
         }

      }
   });

   $scope.localize = function() {
      if( map) {
         Maps.localize(map, function(err, pos) {
            if(err) {
               console.log('Error: ' + err);
            }
            else {
               marker = Maps.deleteMarker(marker);
               marker = Maps.setMarker(map,pos);
               $scope.newArticle.markerSet = true;
            }
         });
      }
      else {
         console.log('Map not valid! Cannot localize!');
      }
   };

   $scope.data = {
      text: '',
      images: [],
      videos: []
   };

   $scope.newArticle = {
      title: '',
      markerSet: false,
      place: {},
      data: []
   };

   $scope.trashArticle = function() {
      $scope.newArticle.title = '';
      $scope.newArticle.data = [];
      $scope.newArticle.place = {};
      $ionicHistory.goBack();
   };

   //Post the new article to the server and also post any subarticles that may be
   //attached to it
   $scope.postArticle = function() {

      var cb = function(err, position) {
         if(err) {
            console.log('Error getting users position: ' + err.message);
         }

         var loc = {
            lat: 0,
            lng: 0
         };

         if(position.coords) {
            if(!err) {
               Position.set(position);
            }
            loc = {
               lat: position.coords.latitude,
               lng: position.coords.longitude
            };
         }
         else {
            loc = position;
         }

         Article.create({
            date: Date.now(),
            isPrivate: false,
            location: loc,
            username: $scope.user.username,
            title: $scope.newArticle.title
         })
         .$promise
         .then( function(res) {
            if( $scope.newArticle.data.length > 0 ){
               postSubarticle(res.id, function(res) {
                  console.log('Succesful sub creation: ' + res);
               });
            }
            $scope.trashArticle();
         }, function(err) {
            console.log('Error posting article: ' + err);
         });
      };

      if(marker) {
         var position = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
         };
         cb(null, position);
         console.log('Using marker position!!!');
      }
      else {
         console.log('Cannot post article without position');
      }
   };

   /* Subarticle posting */

   //Clean up the subarticle and go back to the article view
   $scope.trashSubarticle = function() {
      $scope.data.text = '';
      $scope.images = [];
      $scope.videos = [];
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
   };

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

      var handle = function (res) {
         subs.push(res);
         if ( subs.length === data.videos.length) {
            cb(subs);
         }
      };

      for( var i = 0; i < data.videos.length; i++) {
         var video = data.videos[i];
         Article.subarticles.create({
            id: id,
            date: Date.now(),
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
         .$promise.then(handle);
      }
   };

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
   };

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

      var handle = function (res) {
         subs.push(res);
         if ( subs.length === data.images.length) {
            cb(subs);
         }
      };

      for( var i = 0; i < data.images.length; i++) {
         var image = data.images[i];

         var subarticle = {
            id: id,
            parentId: id,
            date: Date.now(),
            username: $scope.user.username,
            _file: {
               type: 'image',
               name: image.URI,
               size: 5000,
               caption: image.caption
            }
         };

         Article.subarticles.create(subarticle)
         .$promise.then(handle);
      }
   };

}]);
