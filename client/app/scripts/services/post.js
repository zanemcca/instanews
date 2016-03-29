
// jshint camelcase: false
'use strict';

var app = angular.module('instanews.service.post', ['ionic', 'ngResource']);

app.factory('Post', [
  '$q',
  'Article',
  'Camera',
  'Maps',
  'observable',
  'Platform',
  'Subarticles',
  'Uploads',
  function(
    $q,
    Article,
    Camera,
    Maps,
    observable,
    Platform,
    Subarticles,
    Uploads
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

    var postSubarticles = function (Uplds, parentId) {
      Platform.analytics.trackEvent('Post Subarticles', 'start');
      var completed = 0;
      var failed = 0;
      var uploads = Uplds.get();
      var hasMediaItems = Uplds.hasMediaItems();
      var total = uploads.length;

      var done = function () {
        completed++;
        if(completed === total) {
          posting = false;
          Subarticles.findOrCreate(parentId).reload();

          if(failed) {
            Platform.analytics.trackEvent('Post Subarticles', 'failed');

            Platform.showConfirm('Something went wrong with your post!', 'Post failed', ['Retry', 'Try Later'], function(idx) {
              switch(idx) {
                case 1: //Retry
                  uploads = Uplds.get();
                  for(var i in uploads) {
                    if(!uploads[i].resolved) {
                      uploads[i].complete = $q.defer();
                      uploads[i].resolve();
                    }
                  }
                  postSubarticles(Uplds, parentId);
                  break;
                  /*
                case 3: //Cancel
                  console.log('Delete the objects');
                  uploads = Uplds.get();
                  for(var i in uploads) {
                    uploads[i].remove();
                  }
                  break;
                 */
                default: //Try later
                  console.log('Leave the objects');
                  break;
              }
            });
          } else {
            Platform.analytics.trackEvent('Post Subarticles', 'success');
            if(hasMediaItems) {
              Platform.showToast('Your content has finished uploading and should be available soon');
            }
          }
        }
      };

      uploads.slice().forEach(function (upload) {
        upload.isPosting = true;
        upload.complete.promise.then( function () {
          var sub = upload.subarticle;
          sub.parentId = parentId;
          sub.id = parentId;

          Article.subarticles.create(sub)
          .$promise
          .then(function () {
            upload.remove();
            done();
            upload.isPosting = false;
            Platform.analytics.trackEvent('Post Subarticles', 'createSubarticle');
          }, 
          // istanbul ignore next
          function(err) {
            failed++;
            upload.isPosting = false;
            console.log('Failed to upload subarticle');
            Platform.analytics.trackEvent('Post Subarticles', 'createSubarticle', 'error', err.toString());
            console.log(err);
            done();
          });
        }, 
        // istanbul ignore next
        function (err) {
          upload.isPosting = false;
          failed++;
          Platform.analytics.trackEvent('Post Subarticles', 'upload', 'error', err.toString());
          console.log(err);
          done();
        });
      });
    };

    var post = function (Uplds, article, cb) {
      var uploads = Uplds.get();
      posting = true;

      // istanbul ignore else
      if(uploads.length) {
        if(typeof article === 'string') {
          Uploads.moveToPending(article);
          postSubarticles(Uplds, article);
          cb();
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
              //Reset the article
              newArticle = {
                title: ''
              };

              Uploads.moveToPending('newArticle',res.id);
              postSubarticles(Uplds, res.id);
              cb();
            }, function (err) {
              posting = false;
              console.log('Failed to create article');
              console.log(err);
              cb(err);
            });
          });
        } else {
          var err = new Error('Cannot post malformed article');
          console.log(err);
          cb(err);
        }
      } else {
        var e = new Error('Cannot post anything without subarticles');
        console.log(e);
        cb(e);
      }
    };

    var newArticle = {
      title: ''
    };

    var getNewArticle = function () {
      return newArticle;
    };

    return {
      getNewArticle: getNewArticle,
      isValidArticle: isValidArticle,
      isValidSubarticle: isValidSubarticle,
      post: post,
      isPosting: isPosting
    };
  }
]);
