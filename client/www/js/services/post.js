

var app = angular.module('instanews.post', ['ionic', 'ngResource']);

app.factory('Post', [
      'Article',
      'Common',
      function(Article, Common) {

   var photo = function(id, username,  data, cb) {
      console.log('Posting a photo');
      Article.subarticles.create({
         id: id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: id,
         username: username,
         _file: {
            type: 'image',
            name: data.imageURI,
            size: 5000,
            caption: data.caption
         }
      })
      .$promise.then(cb);
   };

   var video = function(id, username, data, cb) {
      var video = data.video;
      Article.subarticles.create({
         id: id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: id,
         username: username,
         _file: {
            type: video.type,
            name: video.fullPath, //TODO load to media service then change this to filename
            size: video.size,
            poster: data.imageURI,
            caption: data.caption
         }
      })
      .$promise.then(cb);
   }

   var text = function(id, username, data, cb) {
      Article.subarticles.create({
         id: id,
         date: Date.now(),
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         parentId: id,
         username: username,
         text: data.text
      })
      .$promise.then(cb);
   };

   var article = function(username, newArticle, cb) {
      if ( newArticle.search ) {
         //TODO Lookup the lat-lng
         newArticle.search = 'My Location';
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      else {
         newArticle.search = 'My Location';
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      Article.create({
         date: Date.now(),
         isPrivate: false,
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         location: loc,
         username: username,
         title: newArticle.title
      })
      .$promise.then(cb);
   };

  return {
     photo: photo,
     text: text,
     video: video,
     article: article
  };
}]);
