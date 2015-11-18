
'use strict';
var app = angular.module('instanews.service.list', ['ionic', 'ngCordova']);

function ListFactory (Platform) {
  //var list = function (spec, my) {
  var list = function (spec) {
    console.log(spec);
    var that;
    // my is for shared secret variables and functions
//    my = my || {};

    // Retreives the list of items
    var get = function () {
      return spec.items;
    };

    // Sorts the items in the list
    var sortingFunction = function(a,b) {
      return b.rating - a.rating;
    };

    // Add or update items in the list
    var add = function (newItems, cb) {
      if(!Array.isArray(newItems)) {
        newItems = [newItems];
      }

      newItems = spec.addFilter(newItems);

      if(newItems.length) {

        newItems.forEach(function (newItem) {
          var update = false;
          for(var i = spec.items.length - 1; i >= 0; i--) {
            if(spec.items[i].id === newItem.id) {
              spec.update(newItem, spec.items[i]);
              update = true;
              break;
            }
          }
          if(!update) {
            spec.items.push(newItem);
          }
        });
        spec.items.sort(spec.sortingFunction);
        notifyObservers();
      } else {
        console.log('No items pased to list.add');
      }

      if(cb) {
        cb(get());
      } else {
        return get();
      }
    };

    // Load more items using the given Find function
    var load = function (cb) {
      if(!spec.options.filter.skip) {
        spec.itemsAvailable = true;
        spec.options.filter.limit = 5;
      } else {
        spec.options.filter.skip = spec.items.length;
      }

      Platform.ready
      .then( function () {
        if(spec.find instanceof Function) {
          /* TODO Take into account fringe cases where content crosses pages.
           * Only dealing with duplicates for the moment
           */
          spec.find(spec.options).$promise.then(function (items) {
            if(!items || !items.length) {
              spec.itemsAvailable = false;
              add([], cb);
            } else {
              spec.options.filter.limit *= 2;  
              add(items, cb);
            }
          }, function (err) {
            console.log('Failed to load more items!');
            console.log(err);
            add([], cb);
          });
        } else {
          console.log('Invalid find function!');
          add([], cb);
        }
      });
    };

    // Remove a subset based on a comparison function
    var remove = function (comparator) {
      var removed = [];
      var remaining = [];
      spec.items.forEach(function (item) {
        if(comparator(item)) {
          removed.push(item);
        } else {
          remaining.push(item);
        }
      });

      if(removed.length) {
        spec.items = remaining;
        notifyObservers();
      }
      return removed;
    };

    // Find by id
    var findById = function (id) {
      for(var i in spec.items) {
        if(spec.items[i].id === id) {
          return spec.items[i];
        }
      }
    };

    // Register and notify observers of the list
    var registerObserver = function(cb) {
      spec.observerCallbacks.push(cb);
    };

    var notifyObservers = function() {
      angular.forEach(spec.observerCallbacks, function(cb) {
        cb();
      });
    };

    var areItemsAvailable = function () {
      return spec.itemsAvailable;
    }



    // Optional
    spec.addFilter = spec.addFilter || function (input) { return input;};

    spec.sortingFunction = spec.sortingFunction || sortingFunction;

    //For simple cases this will do but the update function should
    //have a smarter version given 
    spec.update = spec.update || function (newVal, oldVal) {
      for(var i in newVal) {
        oldVal[i] = newVal[i];
      }
    };

    spec.options = spec.options || {};
    spec.options.filter = spec.options.filter || {};
    spec.options.filter.order = spec.options.filter.order || 'rating DESC';
    spec.options.filter.skip = spec.options.filter.skip || 0;
    spec.options.filter.limit = spec.options.filter.limit || 5;

    // New
    spec.items = [];
    spec.observerCallbacks = [];
    spec.itemsAvailable = false;

    // That is the object to be constructed
    // it has privlidged access to my, and spec
    that = {
      get: get, 
      findById: findById,
      load: load, 
      add: add,
      remove: remove,
      registerObserver: registerObserver,
      notifyObservers: notifyObservers,
      areItemsAvailable: areItemsAvailable
    };

    return that;
  };

  return list;
}

app.factory('list', [
  'Platform',
  ListFactory
]);
