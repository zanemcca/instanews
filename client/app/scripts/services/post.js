
'use strict';

var app = angular.module('instanews.service.post', ['ionic', 'ngResource']);

app.factory('Post', [
  'Article',
  'Platform',
  function(
    Article,
    Platform
  ) {

    var posting = false;

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

    var postSubarticles = function (uploads, parentId) {
      var completed = 0;
      var total = uploads.length;
      uploads.forEach(function (upload) {
        var failed = false;
        upload.complete.promise.then( function () {
          var sub = upload.subarticle;
          sub.parentId = parentId;
          sub.id = parentId;

          console.log(sub);
          if(sub._file) {
            //TODO Video
            //TODO Picture
          }

          Article.subarticles.create(sub)
          .$promise
          .then(function () {
            completed++;
            if(completed === total) {
              posting = false;
              var message = 'Your content has finished uploading and should be available soon';
              if(failed) {
                message = 'Uh-Oh! Some of your content failed to upload!';
              }
              Platform.showToast(message);
            }
          }, function(err) {
            failed = true;
            console.log('Failed to upload subarticle');
            console.log(err);
          });
        }, function (err) {
          console.log(err);
        });
      });
    };

    var post = function (uploads, article) {
      posting = true;
      if(uploads.length) {
        if(article instanceof String) {
          postSubarticles(uploads, article);
        } else if(isValidArticle(article)) { 
          Article.create(article)
          .$promise
          .then( function(res) {
            postSubarticles(uploads, res.id);
          }, function (err) {
            posting = false;
            var message = 'Your article failed to upload. Please make sure you included a title and at least one piece of content.';
            Platform.showToast(message);
            console.log('Failed to create article');
            console.log(err);
          });
        } else {
          console.log('Cannot post malformed article');
        }
      } else {
        console.log('Cannot post anything without subarticles');
      }
    };

    return {
      isValidArticle: isValidArticle,
      isValidSubarticle: isValidSubarticle,
      post: post,
      isPosting: isPosting
    };
  }]);
