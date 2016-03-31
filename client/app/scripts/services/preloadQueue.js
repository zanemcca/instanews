'use strict';
//jshint undef: false
var app = angular.module('instanews.service.preloadQueue', []);

function PreloadQueueFactory($q) {
  if(!this.that) {
    var lastEntry;
    var queueLength = 0;

    var increment = function() {
      queueLength++;
    };

    var decrement = function() {
      if(queueLength > 0) {
        queueLength--;
      } else if(queueLength === 0) {
        console.log('Error: Cannot decrement. Queue is already empty!');
      }
    };

    var stats = {
      queueDelay: 0,
      loadDelay: 0,
      getLength: function () { return queueLength; },
      totalProcessed: 0 
    };

    var flushing = 0;

    var flush = function () {
      flushing = queueLength;
      if(flushing) {
        console.log('Flushing ' + flushing + ' items...');
      }

      queueLength = 0;
    };

    var resolve = function(entry) {
      if(flushing) {
        if(flushing < 0) {
          console.log('Error: ' + (-flushing) + ' excess items flushed');
          flushing = 0;
        } else {
          flushing--;
        }

        entry.reject('flush');
        if(flushing === 0) {
          console.log('...Flush resolved');
        }
      } else {
        entry.resolve();
      }
    };

    var queueEntryFactory = function(item) {
      var deferred = $q.defer();

      var started = Date.now();

      var entry = {
        item: item,
        resolve: function () {
          //Track queueing time
          var resolving = Date.now();
          entry.queueDelay = resolving - started;
          stats.queueDelay = entry.queueDelay*0.3 + stats.queueDelay*0.7;

          item.preLoad(function(err, item) {
            if(err) {
              console.log('Failed to preLoad!');
              console.log(item);
              decrement();
              return deferred.reject(err);
            }

            //Track loading time
            entry.loadDelay = Date.now() - resolving;
            stats.loadDelay = entry.loadDelay*0.3 + stats.loadDelay*0.7;

            if(flushing) {
              flushing--;
              deferred.reject('flush');
              if(flushing === 0) {
                console.log('...Flush resolved');
              }
            } else {
              decrement();
              deferred.resolve(item);
            }
          });
        },
        reject: function(message) {
          deferred.reject(message);
        },
        promise: deferred.promise
      };

      increment();

      if(lastEntry) {
        //Wait for the previous queue to be flushed
        lastEntry.promise.then(function () {
          resolve(entry);
        }, function (err) {
          if(err !== 'flush') {
            console.log('Previous preload failed in the queue!');
            console.log(err);
          }
          resolve(entry);
        });
        lastEntry = entry;
      } else {
        lastEntry = entry;
        resolve(entry);
      }

      return deferred.promise;
    };

    var add = function (items) {
      if(!Array.isArray(items)) { 
        return queueEntryFactory(items);
      } else {
        var promises = [];
        for(var i in items) {
          promises.push(queueEntryFactory(items[i]));
        }

        return $q.all(promises);
      }
    };

    this.that = {
      add: add,
      flush: flush,
      stats: stats
    };
  }
  return this.that;
}

app.factory('PreloadQueue', [
  '$q',
  PreloadQueueFactory
]);
