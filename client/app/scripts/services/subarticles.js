
'use strict';

var app = angular.module('instanews.service.subarticles', ['ionic', 'ngResource']);

app.service('Subarticles', [
  'Article',
  function(
    Article
  ){

   var filter = {
      limit: 50,
      skip: 0,
      where: {
        pending: {
         exists: false
        } 
      },
      order: 'rating DESC'
   };

   var subarticles = [];
   var itemsAvailable = true;
   var observers = [];

   var loadBest = function(id, cb) {
      Article.subarticles({
        id: id,
        filter: {
          limit: 1,
          where: {
            pending: {
             exists: false
            } 
          },
          order: 'rating DESC'
        }
      })
      .$promise
      .then( function (subs) {
        if(subs.length < 1) {
          console.log('No subarticles found for ' + id);
          cb();
        } else {
          cb(subs[0]);
        }
      });
   };

   var load = function(id, cb) {
      Article.subarticles({id: id, filter: filter })
      .$promise
      .then( function (subs) {
         if ( subs.length <= 0 ) {
            itemsAvailable = false;
         }
         else {
            //Update our skip amount
            filter.skip += subs.length;

            //Set the top article and remove duplicates
            for( var i = 0; i < subarticles.length; i++) {
               var subarticle = subarticles[i];

               //Remove duplicates
               for(var j = 0; j < subs.length; j++ ) {
                  var sub = subs[j];
                  if( sub.id === subarticle.id) {
                     subs.splice(j,1);
                     break;
                  }
               }
            }

            //Update our local subarticles
            subarticles = subarticles.concat(subs);
            notifyObservers();
         }
         cb();
      });
   };

   var deleteAll = function() {
     subarticles = [];
     itemsAvailable = true;
     filter.skip = 0;
     notifyObservers();
   };

   var areItemsAvailable = function() {
     return itemsAvailable;
   };

   var registerObserver = function(cb) {
     observers.push(cb);
   };

   var unregisterObserver = function(cb) {
     for(var i = 0; i < observers.length; i++) {
       if(observers[i] === cb) {
         observers.splice(i,1);
         break;
       }
     }
   };

   var notifyObservers = function() {
     observers.forEach(function(cb) {
       cb();
     });
   };

   //TODO var get = function(id) {
   var get = function() {
     return subarticles;
   };

   return {
     get: get,
     load: load,
     loadBest: loadBest,
     deleteAll: deleteAll,
     registerObserver: registerObserver,
     unregisterObserver: unregisterObserver,
     areItemsAvailable: areItemsAvailable
   };
}]);
