
'use strict';

var app = angular.module('instanews.service.uploads', ['ionic', 'ngResource']);

app.service('Uploads', [
  '$q',
  'Camera',
  'observable',
  'User',
  function(
   $q,
   Camera,
   observable,
   User
  ){
    var articles = [];

    var findOrCreate = function (parentId) {
      parentId = parentId || 'newArticle';

      var parent;
      articles.forEach(function(article) {
        if(article.spec.options.id === parentId) {
          console.log('Found cached copy of uploads');
          parent = article;
        }
      });

      if(!parent) {
        parent = {
          spec: {
            options: {
              id: parentId
            }
          }
        };
        parent.uploads = uploadList(parent.spec);

        parent.uploads.getSpec = function () {
          return parent.spec;
        };

        articles.push(parent);
      }

      return parent.uploads;
    };

    var uploadList = function (spec) {
      if(!spec || !spec.options || !spec.options.id) {
        console.log('Cannot create a upload list without the parent id!');
        console.log('Please set spec.options.id');
        return;
      }

      var uploadItems = [];
      var uploads = observable(spec); 

      var addUpload = function (item) {
        uploadItems.unshift(item);
        uploads.notifyObservers();
      };

      function video(video) {
        console.log(video);

        var subarticle = {
          _file: {
            name: video.name,
            sources: [video.nativeURL],
            container: 'instanews-videos-in',
            size: video.size,
            type: video.type
          }
        };

        var upload = {
          container: 'instanews-videos-in',
          uri: video.nativeURL,
          options: {
            fileName: video.name,
            mimeType: video.type,
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        upload.complete = $q.defer();

        return upload;
      };

      function picture(picture) {
        console.log(picture);

        var subarticle = {
          _file: {
            name: picture.name,
            source: picture.nativeURL,
            container: 'instanews-photos-in',
            size: picture.size,
            caption: picture.caption,
            type: picture.type
          }
        };

        var upload = {
          container: 'instanews-photos-in',
          uri: picture.nativeURL,
          options: {
            fileName: picture.name,
            mimeType: picture.type,
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        upload.complete = $q.defer();

        return upload;
      };

      function text(text) {
        var subarticle = {
          text: text
        };

        var upload = {
          subarticle: subarticle,
          noFile: true,
          complete: $q.defer()
        };

        return upload;
      };

      // Public functions
      uploads.get = function (){
        return uploadItems;
      };

      //Capture video using the video camera
      uploads.captureVideo = function() {
        Camera.captureVideo()
        .then( function(vid) {
          if(vid) {
            addUpload(video(vid));
          }
        },
        // istanbul ignore next
        function(err) {
          console.log(err);
        });
      };

      //Get a photo(s) from the gallery
      uploads.getFromGallery = function() {
        Camera.openMediaGallery()
        .then( function(media) {
          if(media) {
            console.log(media);
            if(media.type.indexOf('image') > -1) {
              addUpload(picture(media));
            } else if (media.type.indexOf('video') > -1) {
              addUpload(video(media));
            }
          }
        },
        // istanbul ignore next
        function(err) {
          console.log(err);
        });
      };

      //Capture a photo using the camera and store it into the new article
      uploads.capturePicture = function() {
        Camera.capturePicture()
        .then( function(photo) {
          if(photo) {
            addUpload(picture(photo));
          }
        }, 
        // istanbul ignore next
        function(err) {
          console.log('Error: Failed to capture a new photo: ' + JSON.stringify(err));
        });
      };


      return uploads;
    };

    return {
      findOrCreate: findOrCreate 
    };
  }
]);
