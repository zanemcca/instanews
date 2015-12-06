
'use strict';

var app = angular.module('instanews.service.uploads', ['ionic', 'ngResource']);

app.service('Uploads', [
  '$q',
  'Camera',
  'ENV',
  'FileTransfer',
  'TextInput',
  'observable',
  'User',
  function(
    $q,
    Camera,
    ENV,
    FileTransfer,
    TextInput,
    observable,
    User
  ){
    var articles = [];
    var pending = [];

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

    var moveToPending = function (parentId, newId) {
      parentId = parentId || 'newArticle';
      newId = newId || parentId;

      var i = 0;
      var pend;
      for(; i < articles.length; i++) {
        var article = articles[i];
        if(article.spec.options.id === parentId) {
          console.log('Found cached copy of uploads');
          pend = article;
          break;
        }
      }

      if(!pend) {
        console.log('Error: There are no uploads for ' + parentId);
        return;
      }

      pend = articles.splice(i,1)[0];
      pend.spec.options.id = newId;

      pending.push(pend);
      return pend;
    };

    var getPending = function () {
      var i = pending.length;
      while(i > 0) {
        i--;
        if(!pending[i].uploads.get().length) {
          pending.splice(i,1);
        }
      }
      return pending;
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
        item.remove = function () {
          var removed = uploadItems.splice(uploadItems.indexOf(item), 1);
          uploads.notifyObservers();
          return removed;
        };

        item.resolve = function () {
          if(!item.resolved) {
            item.resolved = true;
            if(item.subarticle._file) {
              var getServer = function() {
                var urlBase = ENV.apiEndpoint;
                return urlBase + '/storages/' + item.container + '/upload/';
              };
              item.loaded = 0;

              FileTransfer.upload(getServer(), item.uri, item.options)
              .then(function () {
                item.complete.resolve();
              }, function (err) {
                item.complete.reject(err);
                console.log(err);
              }, function (progress) {
                item.loaded = progress.loaded/progress.total * 100;
              });
            } else {
              item.complete.resolve();
            }
          }
        };

        uploadItems.unshift(item);
        uploads.notifyObservers();
      };

      function video(vid) {
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

      uploads.getText = function (txt) {
        txt = txt || {partial:''};
        var textInput = TextInput.get();
        textInput.placeholder = 'What\'s the story?';
        textInput.text = txt.partial;

        textInput.open(function (newText) {
          addUpload(text(newText));
          txt.partial = '';
        }, function (partialText) {
          //Interruption function
          txt.partial = partialText;
        });
      };

      return uploads;
    };

    return {
      moveToPending: moveToPending,
      getPending: getPending,
      findOrCreate: findOrCreate 
    };
  }
]);
