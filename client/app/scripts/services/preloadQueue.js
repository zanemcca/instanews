'use strict';
//jshint undef: false
var app = angular.module('instanews.service.preloadQueue', []);

function PreloadQueueFactory($q) {
  if(!this.that) {
    var queue = [];

    var stats = {
      queueDelay: 0,
      loadDelay: 0,
      getLength: function () { return queue.length; },
      totalProcessed: 0 
    };

    var flushing = 0;

    var flush = function () {
      flushing = queue.length;
      if(flushing) {
        console.log('Flush initiated...');
      }

      queue = [];
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
              var res = queue.shift();
              if(item.id && res.item.id !== item.id) {
                console.log(item);
                console.log(res);
                console.log('Error: Queue did not remove the correct item!');
              } 

              deferred.resolve(item);
            }
          });
        },
        reject: function(err) {
          if(!flushing) {
            var res = queue.shift();
            if(!res || (item.id && res.item.id !== item.id)) {
              console.log(item);
              console.log(res);
              console.log('Error: Queue did not remove the correct item!');
            } 
          }
          deferred.reject(err);
        },
        promise: deferred.promise
      };

      queue.push(entry);

      if(queue.length === 1) {
        entry.resolve();
      } else {
        //Wait for the previous queue to be flushed
        queue[queue.length - 2].promise.then(function () {
          resolve(entry);
        }, function (err) {
          if(err !== 'flush') {
            console.log('Previous preload failed in the queue!');
            console.log(err);
          }
          resolve(entry);
        });
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
