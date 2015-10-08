
'use strict';

var app = angular.module('instanews.service.post', ['ionic', 'ngResource', 'uuid']);

app.factory('Post', [
  'Article',
  'LocalStorage',
  'ENV',
  'FileTransfer',
  'User',
  'Platform',
  'rfc4122',
  function(
    Article,
    LocalStorage,
    ENV,
    FileTransfer,
    User,
    Platform,
    rfc4122
  ) {

   var posting = false;
   var pending = [];
   
   Platform.ready
   .then( function() {
     LocalStorage.readFiles('pending', function(err, res) {
       if(err) {
         console.log('Error: Failed to retrieve pending articles: ' + JSON.stringify(err));
       }
       else {
         pending = res;
       }
       //TODO Prompt the user to do something with the pending articles
     });
   });

   var isValidArticle = function(article) {
     if( article.title && typeof article.title === 'string' && article.title.length > 0 &&
        article.position && article.position.lat && article.position.lng &&
        typeof article.position.lat === 'number' && typeof article.position.lng === 'number' &&
        article.text.length + article.videos.length + article.photos.length > 0
     ) {
       return true;
     }
     else {
       return false;
     }
   };

   var isValidSubarticle = function(sub) {
     if( sub.parentId && typeof sub.parentId === 'string' && sub.parentId.length > 0 &&
        sub.text.length + sub.videos.length + sub.photos.length > 0
     ) {
       return true;
     }
     else { 
       return false;
     }
   };

   var getNewArticle = function() {
     var art =  {
       tempId: '',
       videos: [],
       photos: [],
       text: []
     };
     art.tempId = rfc4122.v4();
      
     return saveArticle(art);
   };

   var getArticle = function(tempId) {
     if( tempId ) {
       for( var i = 0; i < pending.length; i++) {
         if( pending[i].tempId === tempId ) {
           return pending[i];
         }
       }
       console.log('Error: No articles were found the the tempId ' + tempId);
     }
     else {
       return getNewArticle();
     }
   };

   /* Saving functions */
   var saveArticle = function(article) {
     var idx = -1;
     for( var i = 0; i < pending.length; i++) {
       if( pending[i].tempId === article.tempId ) {
         idx = i;
         break;
       }
     }

     if( idx < 0) {
       pending.push(article);
     }
     else {
       pending[idx] = article;
     }

     LocalStorage.writeFile('pending', article.tempId + '.json', article);
     return article;
   };

   var saveTitle = function(title, tempId) {
     var article = getArticle(tempId);
     article.title = title;
     return saveArticle(article);
   };

   var savePosition = function(position, tempId) {
     var article = getArticle(tempId);
     if( position.lat && position.lng ) {
       article.position = position;
       return saveArticle(article);
     }
     else {
       console.log('Error: Bad position given! Will not save the position!');
       return article;
     }
   };

   var saveParentId = function(parentId, tempId) {
     var article = getArticle(tempId);
     article.parentId = parentId;
     return saveArticle(article);
   };

   var saveVideos = function(videos, tempId) {
     var article = getArticle(tempId);
     article.videos = article.videos.concat(videos);
     return saveArticle(article);
   };

   var savePhotos = function(photos, tempId) {
     var article = getArticle(tempId);
     article.photos = article.photos.concat(photos);
     return saveArticle(article);
   };

   var saveText = function(text, tempId) {
     var article = getArticle(tempId);
     article.text = article.text.concat(text);
     return saveArticle(article);
   };

   /* Deletion functions */
   var deleteVideo = function(video, tempId) {
     var article = getArticle(tempId);
     for( var i = 0; i < article.videos.length; i++) {
       if(article.videos[i].name === video.name) {
         article.videos.splice(i,1);
         break;
       }
     }
     return saveArticle(article);
   };

   var deletePhoto = function(photo, tempId) {
     var article = getArticle(tempId);
     for( var i = 0; i < article.photos.length; i++) {
       if(article.photos[i].name === photo.name) {
         article.photos.splice(i,1);
         break;
       }
     }
     return saveArticle(article);
   };

   var deleteText = function(text, tempId) {
     var article = getArticle(tempId);
     for( var i = 0; i < article.text.length; i++) {
       if(article.text[i] === text) {
         article.text.splice(i,1);
         break;
       }
     }
     return saveArticle(article);
   };

   var deleteArticle = function(article) {
     for( var i = 0; i < pending.length; i++) {
       if(pending[i].tempId === article.tempId) {
         pending.splice(i,1);
         break;
       }
     }
     LocalStorage.deleteFile('pending', article.tempId + '.json');
   };

   var isPosting = function() {
     return posting;
   };

   /* Posting functions */
   var post = function(tempId) {

     posting = true;
     var article = getArticle(tempId);
     
     if(isValidArticle(article)){
       Article.create({
          isPrivate: false,
          location: article.position,
          title: article.title
       })
       .$promise
       .then( function(res) {
         console.log(res);
         article.parentId = res.id;
         article.title = null;
         article.position = null;
         saveArticle(article);
         postSubarticle(article);
       });
     }
     else if(isValidSubarticle(article)) {
       postSubarticle(article);
     }
     else {
       console.log('There were no subarticles given so the article will not be saved');
       posting = false;
     }
   };

   var progress = function () {
         //console.log('Progress: ' + JSON.stringify(progress));
   };
    
   //Determine the type of subarticle the data is posting and then
   // call the appropriate posting function
  var postSubarticle = function(art) {

    var total = art.videos.length + art.photos.length + art.text.length;
    var finished = 0;

    var onSuccess = function() {
      finished++;
      if( finished === total) {
        posting = false;
        deleteArticle(art);
        Platform.showToast('Your content has finished uploading');
      }
    };

    //Called after the video has been uploaded
     var onVideoUploadSuccess = function() {
       console.log('Succesful upload of video!');

       options.fileName = sub._file.poster; 
       options.mimeType = 'image/jpeg'; 

       FileTransfer.upload(server, video.thumbnailURI, options)
       .then( function() {
         console.log('Succesful upload of thumbnail!');
          Article.subarticles.create(sub)
          .$promise
          .then( function() {
            console.log('Successful subarticle creation!');
            deleteVideo(video, art.tempId);
            onSuccess();
          }, function(err) {
            console.log('Error: Failed to post subarticle: ' + JSON.stringify(err));
          });
       }, function(err) {
         console.log('Error: Failed to upload thumbnail: ' + JSON.stringify(err));
       }, progress);
     };

     //Called after the photo has been uploaded
    var onPhotoUploadSuccess = function() {
      //Success Callback
      console.log('Successful image upload!');
      Article.subarticles.create(subarticle)
      .$promise
      .then( function() {
        deletePhoto(photo, art.tempId);
        onSuccess();
        console.log('Successful subarticle creation!');
      }, function(err) {
        console.log('Error: Failed to post subarticle: ' + JSON.stringify(err));
      });
    };

    //Called after the text has been posted
    var onTextPostSuccess = function(res) {
      deleteText(res.text, art.tempId);
      onSuccess();
      console.log('Successful subarticle creation!');
    };

    var error = function(err) {
      //TODO Notify the user and ask if they want to retry
      console.log('Error: ' + JSON.stringify(err));
    };

     //Upload all videos
    var videos = art.videos.slice(0);
    for(var i = 0; i < videos.length; i++) {
      var video = videos[i];

      var sub = createVideo(art.parentId, video);
      var server = ENV.apiEndpoint + '/storages/' + sub._file.container + '/upload';

      var options = {
        fileName: video.name,
        mimeType: video.type,
        headers: { 'Authorization': User.getToken()}
      };

      FileTransfer.upload(server, video.nativeURL, options)
      .then( onVideoUploadSuccess, error, progress);
    }

    //Upload all photos
    var photos = art.photos.slice(0);
    for(var j = 0; j < photos.length; j++) {

      var photo =  photos[j];
      var subarticle = createPhoto(art.parentId, photo);
      var photoServer = ENV.apiEndpoint + '/storages/' + subarticle._file.container + '/upload';

      var opt = {
        fileName: photo.name,
        mimeType: photo.type,
        headers: { 'Authorization': User.getToken()}
      };

      FileTransfer.upload(photoServer, photo.nativeURL, opt)
      .then( onPhotoUploadSuccess, error, progress);
    }

    //Upload all text
    art.text.forEach( function(text) {
      Article.subarticles.create(createText(art.parentId, text))
      .$promise
      .then(onTextPostSuccess, error);
    });
  };

  //Create a text subarticle for the given parentId
   var createText = function(id, text) {
      return {
         id: id,
         parentId: id,
         text: text
      };
   };

  //Create a video subarticle for the given parentId
  var createVideo = function(id, video) {
    var container = 'instanews.videos';
    var poster = video.name.slice(0,video.name.lastIndexOf('.') + 1) + 'jpg';
    return {
      id: id,
      parentId: id,
      _file: {
        type: video.type,
        container: container,
        name: video.name,
        size: video.size,
        poster: poster,
        lastModified: video.lastModified,
        caption: video.caption
      }
    };
  };

  //Create a photo subarticle for the given parentId
  var createPhoto = function(id, photo) {
    var container = 'instanews.photos';

    var subarticle = {
      id: id,
      parentId: id,
      _file: {
        container: container,
        type: photo.type,
        name: photo.name,
        size: photo.size,
        lastModified: photo.lastModified,
        caption: photo.caption
      }
    };

    return subarticle;
  };

  return {
    getArticle: getArticle,
    isValidArticle: isValidArticle,
    isValidSubarticle: isValidSubarticle,
    saveArticle: saveArticle,
    saveVideos: saveVideos,
    savePhotos: savePhotos,
    saveText: saveText,
    saveTitle: saveTitle,
    saveParentId: saveParentId,
    savePosition: savePosition,
    deleteVideo: deleteVideo,
    deletePhoto: deletePhoto,
    deleteText: deleteText,
    deleteArticle: deleteArticle,
    post: post,
    isPosting: isPosting
  };
}]);
