
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

    // Triggered when an item in the list wants to be updated
    var update = function (newValue, oldValue) {
      if( newValue.modified >= oldValue.modified ) {
        oldValue.rating = newValue.rating;
        oldValue.title = newValue.title;
        oldValue.modified = newValue.modified;
        oldValue.downVoteCount = newValue.downVoteCount;
        oldValue.upVoteCount = newValue.upVoteCount;
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
      var hidden = [];
      var inView = [];

      arts.forEach(function(article) {

        article.saveTitle = function () {
          console.log(article.title);
          Article.prototype$updateAttributes({
            id: article.id
          },
          {
            title: article.title
          },
          function (res) {
            console.log('Successful title update');
            console.log(res);
          },
          function (err) {
            console.log(err);
          });
        };

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
    };

    var preLoad = function (article, cb) {
      //TODO This should be within a $scope.$apply in order to be rendered
      var update = function () {
        //console.log('Trying to get topSubarticle');
        var subarticle = article.Subarticles.getTop();
        if(subarticle) {
          article.topSub = subarticle;
        }
      };

      if(!article.Subarticles) {
        article.Subarticles = Subarticles.findOrCreate(article.id);
        article.Subarticles.registerObserver(update);
      }


      var spec = article.Subarticles.getSpec();
      spec.options.filter.skip = 0;
      spec.options.filter.limit = 1;
      article.Subarticles.load();

      cb(article);
    };

    var spec = {};
    spec.preLoad = preLoad;
    spec.find = Article.find;
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
    var hiddenArticles = list({
      update: update
    });

    // Reorganize the articles into the viewable array and the hidden array
    var reorganize = function() {
      var total = articles.get().length + hiddenArticles.get().length;
      console.log('Reorganizing ' + total + ' articles!');
      var toOutView = articles.remove(function (article) {
        var position = Position.posToLatLng(article.location);
        return !Position.withinBounds(position);
      });

      var toInView = hiddenArticles.remove(function (article) {
        var position = Position.posToLatLng(article.location);
        return Position.withinBounds(position);
      });

      //      console.log(toOutView.length + ' going out of view and ' + toInView.length + ' going into the view');
      articles.add(toInView);
      hiddenArticles.add(toOutView);
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
      spec.options.filter.limit = 5;

      console.log('UpateBounds');

      Platform.loading.show();

      articles.load(function () {
        //TODO Lets rethink this potentially unnecessary reorganize
        reorganize();
        Platform.loading.hide();
      });
    };

    Position.registerBoundsObserver(updateBounds);

    return articles;
  }
]);
