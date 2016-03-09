
'use strict';

var app = angular.module('instanews.service.articles', ['ionic', 'ngResource','ngCordova']);

app.service('Articles', [
  '$filter',
  'Article',
  'list',
  'Subarticles',
  'Platform',
  'Position',
  function(
    $filter,
    Article,
    list,
    Subarticles,
    Platform,
    Position
  ){

    var updateRating = false;
    // Triggered when an item in the list wants to be updated
    var update = function (newValue, oldValue) {
      if( newValue.modified >= oldValue.modified ) {
        if(updateRating) {
          oldValue.rating = newValue.rating;
        }
        oldValue.title = newValue.title;
        oldValue.modified = newValue.modified;
        oldValue.downVoteCount = newValue.downVoteCount;
        oldValue.upVoteCount = newValue.upVoteCount;
        oldValue.createCommentCount = newValue.createCommentCount;
        oldValue.createSubarticleCount = newValue.createSubarticleCount;
        oldValue.verified = newValue.verified;
        oldValue.version = newValue.version;
        //TODO Remove once the vote service is completed
        oldValue.downVotes = newValue.downVotes;
        oldValue.upVotes = newValue.upVotes;
      }
    };

    // Triggered when a new batch of articles wants to be added to the list
    // allows for additional filtering
    var addFilter = function(arts) {
      /*
       * Disable add filter because we are not caching out of view articles
       * so if they are out of view they should be cleaned up after a map move
      var hidden = [];
      var inView = [];

      arts.forEach(function(article) {

        var position = Position.posToLatLng(article.location);
        if(Position.withinBounds(position)) {
          inView.push(article);
        } else {
          hidden.push(article);
        }
      });

      //     console.log(inView.length + ' added to inView and ' + hidden.length + ' added to hidden');
      if(hidden.length) {
        hiddenArticles.add(hidden);
      }
      return inView;
      */
      return arts;
    };

    var save = function () {
      Article.prototype$updateAttributes({
        id: this.id
      },
      {
        title: this.title
      },
      function () {
        console.log('Successful title update');
      },
      function (err) {
        console.log(err);
      });
    };

    var preLoad = function (article, cb) {
      if(!article.preloaded) {
        article.preloaded = true;

        //TODO This should be within a $scope.$apply in order to be rendered
        var update = function () {
          //console.log('Trying to get topSubarticle');

          //If all the subarticles have been removed then remove the article
          if(article.Subarticles.get().length === 0) {
            //Attempt to load more subarticles
            article.Subarticles.load(function (err, subs) {
              if(err || subs.length === 0) {
                if(err) {
                  console.log('Failed to load top subarticle');
                  console.log(err);
                }
                articles.remove(function (art) {
                  return (art.id === article.id);
                });
              }
            });
          } else {
            var subarticle = article.Subarticles.getTop();
            if(subarticle) {
              article.Subarticles.preLoad(subarticle, function (err, sub) {
                if(err) {
                  console.log(err);
                  articles.remove(function (art) {
                    return (art.id === article.id);
                  });
                } else {
                  article.topSub = sub;
                }
              });
            }
          }
        };

        if(!article.Subarticles) {
          article.Subarticles = Subarticles.findOrCreate(article.id);

          //TODO This should be removed on destroy event
          article.Subarticles.registerObserver(update);
        }

        var spec = article.Subarticles.getSpec();
        spec.options.filter.skip = 0;
        spec.options.filter.limit = 1;
        article.Subarticles.load(function (err) {
          if(err) {
            console.log(err);
            return cb(new Error('Failed to find top subarticle'), article);
          }
          var top = article.Subarticles.getTop();
          if(top) {
            article.Subarticles.preLoad(top, function (err) {
              cb(err, article);
            });
          } else {
            console.log('Failed to find a top subarticle!');
            cb(new Error('Failed to find top subarticle'), article);
          }
        });
      } else {
        cb(null, article);
      }
    }; 

    var spec = {};
    spec.preLoad = preLoad;
    spec.save = save;

    spec.find = Article.find;
    spec.findById = Article.findById;
    spec.update = update;
    spec.addFilter = spec.addFilter || addFilter;
    spec.options = spec.options || {};
    //TODO Move this to the backend as a default filter
    spec.options.filter = {
      where: {
        pending: {
          exists: false
        }
      }
    };

    // Create a list for articles within view
    var articles = list(spec);

    // Create a headless list for out of view articles
    /*
    var hiddenArticles = list({
      update: update
    });
    */

    // Reorganize the articles into the viewable array and the hidden array
    var reorganize = function() {
      var total = articles.get().length;// + hiddenArticles.get().length;
      console.log('Reorganizing ' + total + ' articles!');
      //var toOutView = 
      articles.remove(function (article) {
        var position = Position.posToLatLng(article.location);
        return !Position.withinBounds(position);
      });

      /*
      var toInView = hiddenArticles.remove(function (article) {
        var position = Position.posToLatLng(article.location);
        return Position.withinBounds(position);
      });

      //      console.log(toOutView.length + ' going out of view and ' + toInView.length + ' going into the view');
      articles.add(toInView);
      hiddenArticles.add(toOutView);
     */
    };

    //Update the filter bounds 
    var updateBounds = function() {
      var bounds = Position.getBounds();

      // istanbul ignore else
      if(bounds) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        spec.options.filter.where.location = {
          geoWithin: {
            $box: [
              [sw.lat(), sw.lng()],
              [ne.lat(), ne.lng()]
            ]
          }
        };
      }
      else {
        console.log('Bounds not set yet!');
      }

      spec.options.filter.skip = 0;
      spec.options.filter.limit = 100;

      console.log('UpateBounds');

      Platform.loading.show();

      updateRating = true;
      articles.load(function (err) {
        updateRating = false;
        Platform.loading.hide();

        if(err) {
          return console.log(err);
        }
        //TODO Lets rethink this potentially unnecessary reorganize
        reorganize();
      });
    };

    Position.registerBoundsObserver(updateBounds);

    articles.reorganize = reorganize;
    articles.getSpec = function () {
      return spec;
    };

    return articles;
  }
]);
