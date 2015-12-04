
// jshint camelcase: false
'use strict';

var app = angular.module('instanews.service.post', ['ionic', 'ngResource']);

app.factory('Post', [
  'Article',
  'Camera',
  'Maps',
  'observable',
  'Platform',
  'Upload',
  function(
    Article,
    Camera,
    Maps,
    observable,
    Platform,
    Upload
  ) {

    var posting = false;

    var uploadItems = [];
    var uploads = observable(); 

    uploads.get = function (){
      return uploadItems;
    };

    var addUpload = function (item) {
      uploadItems.unshift(item);
      uploads.notifyObservers();
    };

    var isValidArticle = function(article) {
      if( article.title && typeof article.title === 'string' && article.title.length > 0 &&
         article.location && article.location.lat && article.location.lng &&
         typeof article.location.lat === 'number' && typeof article.location.lng === 'number' 
        ) {
          return true;
        }
        else {
          return false;
        }
    };

    var isValidSubarticle = function(sub) {
      if( sub.parentId && typeof sub.parentId === 'string' && sub.parentId.length > 0 &&
         (sub.text || (sub._file && sub._file.type && ((sub._file.sources && sub._file.sources.length) || sub._file.source)))
        ) {
          return true;
        }
        else { 
          return false;
        }
    };

    var isPosting = function() {
      return posting;
    };

    var postSubarticles = function (parentId) {
      var completed = 0;
      var total = uploadItems.length;
      uploadItems.forEach(function (upload) {
        var failed = false;
        upload.complete.promise.then( function () {
          var sub = upload.subarticle;
          sub.parentId = parentId;
          sub.id = parentId;

          console.log(sub);

          Article.subarticles.create(sub)
          .$promise
          .then(function () {
            completed++;
            if(completed === total) {
              posting = false;
              var message = 'Your content has finished uploading and should be available soon';
              if(failed) {
                message = 'Uh-Oh! Some of your content failed to upload!';
                //TODO Allow retrying
              }
              Platform.showToast(message);
              uploadItems = [];
            }
          }, 
          // istanbul ignore next
          function(err) {
            failed = true;
            console.log('Failed to upload subarticle');
            console.log(err);
          });
        }, 
        // istanbul ignore next
        function (err) {
          console.log(err);
        });
      });
    };

    var post = function (article) {
      posting = true;

      // istanbul ignore else
      if(uploadItems.length) {
        if(typeof article === 'string') {
          postSubarticles(article);
          // istanbul ignore else 
        } else if(isValidArticle(article)) { 
          Maps.getPlace(article.location, function (place) {
            article.place = [];
            var whitelist = [
              'route',
              'neighborhood',
              'locality',
              'administrative_area_level_1',
              'country'
            ];

            for(var i in place.address_components) {
              if(whitelist.indexOf(place.address_components[i].types[0]) > -1) {
                article.place.push(place.address_components[i]);
              }
            }

            Article.create(article)
            .$promise
            .then( function(res) {
              postSubarticles(res.id);
            }, function (err) {
              posting = false;
              var message = 'Your article failed to upload. Please make sure you included a title and at least one piece of content.';
              Platform.showToast(message);
              console.log('Failed to create article');
              console.log(err);
            });
          });
        } else {
          console.log('Cannot post malformed article');
        }
      } else {
        console.log('Cannot post anything without subarticles');
      }
    };

    //Capture video using the video camera
    var captureVideo = function() {
      Camera.captureVideo()
      .then( function(video) {
        if(video) {
          addUpload(Upload.video(video));
        }
      },
      // istanbul ignore next
      function(err) {
        console.log(err);
      });
    };

    //Get a photo(s) from the gallery
    var getFromGallery = function() {
      Camera.openMediaGallery()
      .then( function(media) {
        if(media) {
          console.log(media);
          if(media.type.indexOf('image') > -1) {
            addUpload(Upload.picture(media));
          } else if (media.type.indexOf('video') > -1) {
            addUpload(Upload.video(media));
          }
        }
      },
      // istanbul ignore next
      function(err) {
        console.log(err);
      });
    };

    //Capture a photo using the camera and store it into the new article
    var capturePicture = function() {
      Camera.capturePicture()
      .then( function(photo) {
        if(photo) {
          addUpload(Upload.picture(photo));
        }
      }, 
      // istanbul ignore next
      function(err) {
        console.log('Error: Failed to capture a new photo: ' + JSON.stringify(err));
      });
    };

    return {
      isValidArticle: isValidArticle,
      isValidSubarticle: isValidSubarticle,
      post: post,
      captureVideo: captureVideo,
      capturePicture: capturePicture,
      getFromGallery: getFromGallery,
      uploads: uploads,
      isPosting: isPosting
    };
  }
]);
