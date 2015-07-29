
'use strict';

var app = angular.module('instanews.service.subarticles', ['ionic', 'ngResource']);

app.service('Subarticles', [
  'Article',
  function(
    Article
  ){

   var filter = {
      limit: 10,
      skip: 0,
      order: 'rating DESC'
   };

   var subarticles = [];
   var itemsAvailable = true;
   var observerCallbacks = [];

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
            for( var i = 0; i < subs.length; i++) {
               var subarticle = subs[i];

               //Remove duplicates
               for(var j = 0; j < subarticles.length; j++ ) {
                  var sub = subarticles[j];
                  if( sub.id === subarticle.id) {
                     subs.splice(i,1);
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
     observerCallbacks.push(cb);
   };

   var unregisterObserver = function(cb) {
     for(var i = 0; i < observerCallbacks.length; i++) {
       if(observerCallbacks[i] === cb) {
         observerCallbacks.splice(i,1);
         break;
       }
     }
   };

   var notifyObservers = function() {
     observerCallbacks.forEach(function(cb) {
       cb();
     });
   };

   var get = function(id) {
     return subarticles;
   };

   return {
     get: get,
     load: load,
     deleteAll: deleteAll,
     registerObserver: registerObserver,
     unregisterObserver: unregisterObserver,
     areItemsAvailable: areItemsAvailable
   };
}]);
