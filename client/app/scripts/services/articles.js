
'use strict';

var app = angular.module('instanews.service.articles', ['ionic', 'ngResource','ngCordova']);

app.service('Articles', [
      '$filter',
      'Article',
      'Position',
      function(
         $filter,
         Article,
         Position
      ){

   var inViewArticles = [];
   var outViewArticles = [];
   var itemsAvailable = true;

   var defaultFilter = {
      limit: 50,
      skip: 0,
      include: [{
         relation: 'subarticles',
         scope: {
            limit: 1,
            order: 'rating DESC'
         }
      }],
      rate: true,
      order: 'rating DESC'
   };

   var filter = defaultFilter;

   var areItemsAvailable = function() {
     return itemsAvailable;
   };

   //Update the filter bounds 
   //TODO I think we should probably be loading articles automatically when they change the map
   var updateBounds = function() {
     var bounds = Position.getBounds();

     if(bounds) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        filter.where = {
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

      itemsAvailable = true;
   };

   //Load new articles from the server
   var load = function(cb) {
      /* TODO Take into account fringe cases where content crosses pages.
       * Only dealing with duplicates for the moment
       */
      Article.find({filter: filter })
      .$promise
      .then( function (articles) {
         if ( articles.length <= 0 ) {
            itemsAvailable = false;
         }
         else {
            //Update the global articles list
           //TODO save the subarticlen memory
            add(articles);
         }
         cb();
      });
   };


   //Getters
   var getOne = function (id) {
      var val = $filter('filter')(inViewArticles, {id: id});
      if (val.length > 0) {
         return val[0];
      }
      else {
        val = $filter('filter')(outViewArticles, {id: id});
        if (val.length > 0) {
           return val[0];
        }
      }
   };

   // Find the index of the article if it exists
   // on the array
   var getIndex = function(articles, article) {
     for( var i = 0; i < articles.length; i++) {
       if( articles[i].id === article.id ) {
         return i;
       }
     }
     return -1;
   };

   //Compare function for sorting the articles
  var compareFunction = function(a,b) {
    return b.rating - a.rating;
  };

   // Update or add a new article
   var addOne = function(articles, article) {
     //Set the top subarticle
      if( article.subarticles && article.subarticles.length > 0 ) {
        article.topSub = article.subarticles[0];

        var idx = getIndex(articles, article);
        if( idx >= 0 ) {
          if( article.modified >= articles[idx].modified ) {
            articles[idx] = article;
          }
        }
        else {
          articles.push(article);
        }
        articles.sort(compareFunction);
      }
      else {
        console.log('Warning: An Article without any subarticles has been ignored: ' + article.id);
      }
   };

   var get = function() {
      return inViewArticles;
   };

   // Add the given articles
   var add = function(arts) {
      for(var i = 0; i < arts.length; i++) {
        var position = Position.posToLatLng(arts[i].location);
        if(Position.withinBounds(position)) {
          addOne(inViewArticles, arts[i]);
        }
        else {
          addOne(outViewArticles, arts[i]);
        }
      }
      //Update our skip amount
      filter.skip = inViewArticles.length;

      notifyObservers();
   };

   // Deletes the local articles
   var deleteAll = function() {
     inViewArticles = [];
     filter.skip = 0;
     notifyObservers();
   };

   // Reorganize the articles into the viewable array and the hidden array
   var reorganize = function() {
     var inView = [];
     var outView = [];

     var organize = function(arts) {
       for(var i = 0; i < arts.length; i++) {
          var position = Position.posToLatLng(arts[i].location);
          if(Position.withinBounds(position)) {
            addOne(inView,arts[i]);
          }
          else {
            addOne(outView, arts[i]);
          }
       }
     };

     organize(inViewArticles);
     organize(outViewArticles);
     inViewArticles = inView;
     outViewArticles = outView;

     //Update our skip amount
     filter.skip = inViewArticles.length;

     notifyObservers();
   };

   var observerCallbacks = [];

   var registerObserver = function(cb) {
      observerCallbacks.push(cb);
   };

   var notifyObservers = function() {
      angular.forEach(observerCallbacks, function(cb) {
         cb();
      });
   };

   // Call reorganize every time the bounds change
   Position.registerBoundsObserver(reorganize);
   Position.registerBoundsObserver(updateBounds);

   return {
      get: get,
      add: add,
      load: load,
      deleteAll: deleteAll,
      reorganize: reorganize,
      updateBounds: updateBounds,
      areItemsAvailable: areItemsAvailable,
      registerObserver: registerObserver,
      getOne: getOne
   };
}]);
