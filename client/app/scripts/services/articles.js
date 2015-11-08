
'use strict';

var app = angular.module('instanews.service.articles', ['ionic', 'ngResource','ngCordova']);

app.service('Articles', [
      '$filter',
      'Article',
      'Subarticles',
      'Platform',
      'Position',
      function(
         $filter,
         Article,
         Subarticles,
         Platform,
         Position
      ){

   var Arts = {
     inView: [],
     outView: []
   };

   var itemsAvailable = true;

   var defaultFilter = {
      limit: 50,
      skip: 0,
      /*
      include: [{
         relation: 'subarticles',
         scope: {
            limit: 1,
            order: 'rating DESC'
         }
      }],
      rate: true,
     */
      order: 'rating DESC'
   };

   var filter = defaultFilter;

   var areItemsAvailable = function() {
     return itemsAvailable;
   };

   //Update the filter bounds 
   var updateBounds = function() {
     var bounds = Position.getBounds();

     // istanbul ignore else
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

      filter.skip = 0;

      console.log('UpateBounds');
      itemsAvailable = true;

      Platform.loading.show();

      load(function () {
        reorganize();
        Platform.loading.hide();
      });
   };

   //Load new articles from the server
   var load = function(cb) {
      /* TODO Take into account fringe cases where content crosses pages.
       * Only dealing with duplicates for the moment
       */
      Platform.ready.then( function () {
        Article.find({filter: filter })
        .$promise
        .then( function (articles) {
          console.log('Loaded new articles');
          console.log(articles);
           if ( articles.length <= 0 ) {
              itemsAvailable = false;

              // istanbul ignore else
              if(cb instanceof Function) {
                cb();
              }
           }
           else {
              //Update the global articles list
              add(articles, cb);
           }
        });
      });
   };


   //Getters
   var getOne = function (id) {
      var val = $filter('filter')(Arts.inView, {id: id});
      if (val.length > 0) {
         return val[0];
      }
      else {
        val = $filter('filter')(Arts.outView, {id: id});
        // istanbul ignore else
        if (val.length > 0) {
           return val[0];
        }
      }
   };

   // Find the index of the article if it exists
   // on the array
   var getArticle = function(articles, article) {
     for( var i = 0; i < articles.length; i++) {
       if( articles[i].id === article.id ) {
         return articles[i];
       }
     }
   };

   //Compare function for sorting the articles
  var compareFunction = function(a,b) {
    return b.rating - a.rating;
  };

   // Update or add a new article
   var addOne = function(articles, article, done) {
      var finish = function () {
        var a = getArticle(articles, article);
        if( a ) {
          if( article.modified >= a.modified ) {
            a.rating = article.rating;
            a.title = article.title;
            a.modified = article.modified;
            a.downVoteCount = article.downVoteCount;
            a.upVoteCount = article.upVoteCount;
            a.topSub = article.topSub;
            a.upVotes = article.upVotes;
            a.verified = article.verified;
            a.version = article.version;
          }
        }
        else {
          articles.push(article);
        }
        articles.sort(compareFunction);
        done();
      };

     //Set the top subarticle
      if( article.subarticles && article.subarticles.length > 0 ) {
        article.topSub = article.subarticles[0];
        finish();
      } else {
        Subarticles.loadBest(article.id, function (sub) {
          // istanbul ignore else
          if(sub) {
            article.topSub = sub;
            finish();
          } else {
            console.log('Warning: An Article without any subarticles has been ignored: ' + article.id);
            done();
          }
        });
      }
   };

   var get = function() {
      return Arts.inView;
   };

   // Add the given articles
   var add = function(arts, cb) {
     var total = arts.length;
      // istanbul ignore else
     if(total) {
       var completed = 0;
       var done = function () {
         completed++;
         if(completed === total) {
          //Update our skip amount
          filter.skip = Arts.inView.length;
          notifyObservers();

          if(cb instanceof Function) {
            cb();
          }
         }
       };

        for(var i = 0; i < arts.length; i++) {
          var position = Position.posToLatLng(arts[i].location);
          if(Position.withinBounds(position)) {
            addOne(Arts.inView, arts[i], done);
          }
          else {
            addOne(Arts.outView, arts[i], done);
          }
        }
     } else {
       cb();
     }
   };

   // Deletes the local articles
   var deleteAll = function() {
     Arts.inView = [];
     filter.skip = 0;
     notifyObservers();
   };

   // Reorganize the articles into the viewable array and the hidden array
   var reorganize = function() {
     var total = Arts.inView.length + Arts.outView.length;
     var completed = 0;
     var done = function () {
       completed++;
       if(completed === total) {
        //Update our skip amount
        Arts.inView = inView;
        Arts.outView = outView;
        filter.skip = Arts.inView.length;
        notifyObservers();
       }
     };

     var inView = [];
     var outView = [];

     var organize = function(arts) {
       for(var i = 0; i < arts.length; i++) {
          var position = Position.posToLatLng(arts[i].location);
          if(Position.withinBounds(position)) {
            addOne(inView,arts[i], done);
          }
          else {
            addOne(outView, arts[i], done);
          }
       }
     };

     organize(Arts.inView);
     organize(Arts.outView);
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
//   Position.registerBoundsObserver(reorganize);
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
