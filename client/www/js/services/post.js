

var app = angular.module('instanews.post', ['ionic', 'ngResource']);

app.factory('Post', [
      'Article',
      'Common',
      function(Article, Common) {

   var photo = function(id, username,  data, cb) {

      if ( data.images && data.images.length > 0 ) {
         var subs = [];

         for( var i = 0; i < data.images.length; i++) {
            var image = data.images[i];

            var subarticle = {
               id: id,
               parentId: id,
               date: Date.now(),
               username: username,
               myId: Math.floor(Math.random()*Math.pow(2,32)),
               _file: {
                  type: 'image',
                  name: image.URI,
                  size: 5000,
                  caption: image.caption
               }
            }
            Article.subarticles.create(subarticle)
            .$promise.then( function (res) {
               subs.push(res);
               if ( subs.length === data.images.length) {
                  cb(subs);
               }
            });
         }
      }
      else if ( data.imageURI ) {
         console.log('Posting a photo');
         var subarticle = {
            id: id,
            parentId: id,
            date: Date.now(),
            username: username,
            myId: Math.floor(Math.random()*Math.pow(2,32)),
            _file: {
               type: 'image',
               name: data.imageURI,
               size: 5000,
               caption: data.caption
            }
         }
         Article.subarticles.create(subarticle)
         .$promise.then(cb);
      }

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
      .$promise.then( function(res) {

         if( newArticle.subarticles.length > 0 ){
            for( var i = 0; i < newArticle.subarticles.length; i++) {
               var sub = newArticle.subarticles[i];
               var func;
               if( sub.text ) {
                  func = text;
               }
               else if ( sub.video ) {
                  func = video;
               }
               else {
                  func = photo;
               }

               func(res.myId,username,sub,function(res) {
                  console.log('Succesful sub creation');
               });

            }
         }
         cb(res);
      });
   };

  return {
     photo: photo,
     text: text,
     video: video,
     article: article
  };
}]);
