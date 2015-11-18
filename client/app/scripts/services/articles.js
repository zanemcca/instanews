
'use strict';

var app = angular.module('instanews.service.articles', ['ionic', 'ngResource','ngCordova']);

app.service('Articles', [
  '$filter',
  'Article',
  'List',
  'Subarticles',
  'Platform',
  'Position',
  function(
    $filter,
    Article,
    List,
    Subarticles,
    Platform,
    Position
  ){
    var Arts = {
      inView: [],
      outView: []
    };

    var defaultFilter = {
      skip: 0,
      order: 'rating DESC'
    };

    var options = {
      filter: defaultFilter
    };

    var update = function (newValue, oldValue) {
      if( newValue.modified >= oldValue.modified ) {
        oldValue.rating = newValue.rating;
        oldValue.title = newValue.title;
        oldValue.modified = newValue.modified;
        oldValue.downVoteCount = newValue.downVoteCount;
        oldValue.upVoteCount = newValue.upVoteCount;
        oldValue.topSub = newValue.topSub;
        oldValue.upVotes = newValue.upVotes;
        oldValue.verified = newValue.verified;
        oldValue.version = newValue.version;
      }
    };

    var addFilter = function(arts) {
      var outView = [],
        inView = [];

      arts.forEach(function(article) {
        var position = Position.posToLatLng(article.location);
        if(Position.withinBounds(position)) {
          inView.push(article);
        } else {
          outView.push(article);
        }
      });

      console.log('outView:');
      console.log(otherArticles.add(outView));
      return inView;
    };

    var ArticleList = Object.create(List);
    var otherArticles = Object.create(List);
    //ArticleList._items = [];
    ArticleList.init(Article.find, update, addFilter, options);

    // Reorganize the articles into the viewable array and the hidden array
    var reorganize = function() {
      var toOutView = ArticleList.remove(function (article) {
        var position = Position.posToLatLng(article.location);
        return !Position.withinBounds(position);
      });

      var toInView = otherArticles.remove(function (article) {
        var position = Position.posToLatLng(article.location);
        return Position.withinBounds(position);
      });

      console.log(toOutView.length + ' going out of view and ' + toInView.length + ' going into the view');
      ArticleList.add(toInView);
      otherArticles.add(toOutView);
    };

    //Update the filter bounds 
    var updateBounds = function() {
      var bounds = Position.getBounds();

      // istanbul ignore else
      if(bounds) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        options.filter.where = {
          location: {
            geoWithin: {
              $box: [
                [sw.lat(), sw.lng()],
                [ne.lat(), ne.lng()]
              ]
            }
          }
        };
      }
      else {
        console.log('Bounds not set yet!');
      }

      options.filter.skip = 0;

      console.log('UpateBounds');

      Platform.loading.show();

      ArticleList.load(function () {
        //TODO Lets rethink this potentially unnecessary reorganize
        reorganize();
        Platform.loading.hide();
      });
    };

    Position.registerBoundsObserver(updateBounds);

    return ArticleList;
  }
]);
