
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

      function video(vid) {
        console.log(vid);

        var subarticle = {
          _file: {
            name: vid.name,
            sources: [vid.nativeURL],
            container: 'instanews-videos-in',
            size: vid.size,
            type: vid.type
          }
        };

        var upload = {
          container: 'instanews-videos-in',
          uri: vid.nativeURL,
          options: {
            fileName: vid.name,
            mimeType: vid.type,
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        upload.complete = $q.defer();

        return upload;
      }

      function picture(photo) {
        console.log(photo);

        var subarticle = {
          _file: {
            name: photo.name,
            source: photo.nativeURL,
            container: 'instanews-photos-in',
            size: photo.size,
            caption: photo.caption,
            type: photo.type
          }
        };

        var upload = {
          container: 'instanews-photos-in',
          uri: photo.nativeURL,
          options: {
            fileName: photo.name,
            mimeType: photo.type,
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        upload.complete = $q.defer();

        return upload;
      }

      function text(content) {
        var subarticle = {
          text: content
        };

        var upload = {
          subarticle: subarticle,
          noFile: true,
          complete: $q.defer()
        };

        return upload;
      }

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

      uploads.clear = function () {
        //TODO Do a proper cleanup of uploads. aka - actually cancel the upload
        uploadItems = [];
        uploads.notifyObservers();
      };

      uploads.getText = function () {
        //TODO Link to textinput footer
        addUpload(text('Hello'));
      };

      return uploads;
    };

    return {
      findOrCreate: findOrCreate 
    };
  }
]);
