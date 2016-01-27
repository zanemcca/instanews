
'use strict';
var app = angular.module('instanews.service.list', ['ionic', 'ngCordova']);

function ListFactory (Platform) {
  //var list = function (spec, my) {
  var list = function (spec) {
    var that;
    var ogFilter = {}; // A place to keep the original filter for resets

    // Retreives the list of items
    var get = function () {
      return spec.items;
    };

    var getTop = function () {
      if(spec.items.length) {
        return spec.items[0];
      }
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
            newItem.focus = spec.focus.bind(newItem);
            newItem.save = spec.save.bind(newItem);
            newItem.destroy = function() {
              Platform.showSheet({
                destructiveText: '<i class="icon ion-trash-b assertive"></i> Delete',
                titleText: 'Are you sure you want to delete this?',
                cancelText: 'Cancel',
                destructiveButtonClicked: function() {
                  spec.destroy.call(newItem);
                  return true;
                }
              });
            };
            spec.items.push(newItem);
          }
        });
        spec.items.sort(spec.sortingFunction);

        spec.options.filter.skip = spec.items.length;

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
        //spec.options.filter.limit = ogFilter.limit;
      }

      Platform.ready
      .then( function () {
        var modified = false;
        if(spec.find instanceof Function) {
          /* TODO Take into account fringe cases where content crosses pages.
           * Only dealing with duplicates for the moment
           */
          spec.find(spec.options).$promise.then(function (items) {
            if(!items || !items.length) {
              spec.itemsAvailable = false;
            } else {
              if(items.length < spec.options.filter.limit) {
                spec.itemsAvailable = false;
              }
              spec.options.filter.limit *= 2;  
              spec.options.filter.limit = Math.min(spec.options.filter.limit, 100);
              modified = true;
              add(items, cb);
            }
          }, function (err) {
            console.log('Failed to load more items!');
            console.log(err);
          });
        } else {
          console.log('Invalid find function!');
        }

        if(!modified) {
          if(cb) {
            console.log('Calling callback!');
            cb(get());
          } else {
            return get();
          }
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
        spec.options.filter.skip = spec.items.length;
        notifyObservers();
      }
      return removed;
    };

    // Clears all the items
    var clear = function () {
      if(spec.items.length) {
        spec.items = [];
        notifyObservers();
      }
    };

    // Find by id
    var findById = function (id , cb) {
      for(var i in spec.items) {
        if(spec.items[i].id === id) {
          return cb(spec.items[i]);
        }
      }

      spec.findById({ id: id }).$promise.then( function(item) {
        if(item) {
          that.add([item], function() {
            return findById(id, cb);
          });
        } else {
          cb();
        }
      }, function(err) {
        console.log(err);
        cb();
      });
    };

    var focusById = function (id) {
      findById(id, function(item) {
        item.focus();
      });
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
    };

    var preLoad = function (item, cb) {
      spec.preLoad(item, cb);
    };

    spec.addFilter = spec.addFilter || function (input) { return input;};

    spec.preLoad = spec.preLoad || function(item, cb) {
      cb(item);
    };

    spec.sortingFunction = spec.sortingFunction || sortingFunction;

    //For simple cases this will do but the update function should
    //have a smarter version given 
    spec.update = spec.update || function (newVal, oldVal) {
      for(var i in newVal) {
        oldVal[i] = newVal[i];
      }
    };

    spec.save = spec.save || function () {};
    spec.focus = spec.focus || function () {};
    spec.destroy = spec.destroy || function () {};
    spec.findById = spec.findById || function () {
      return {
        $promise: {
          then: function (succ) {
            succ();
          }
        }
      };
    };

    spec.options = spec.options || {};
    spec.options.filter = spec.options.filter || {};
    spec.options.filter.order = spec.options.filter.order || 'rating DESC';
    spec.options.filter.skip = spec.options.filter.skip || 0;
    spec.options.filter.limit = spec.options.filter.limit || 5;

    for(var i in spec.options.filter) {
      ogFilter[i] = spec.options.filter[i];
    }

    // New
    spec.items = [];
    spec.observerCallbacks = [];
    spec.itemsAvailable = true;

    // That is the object to be constructed
    // it has privlidged access to my, and spec
    that = {
      get: get, 
      clear: clear,
      getTop: getTop, 
      findById: findById,
      focusById: focusById,
      load: load, 
      add: add,
      remove: remove,
      preLoad: preLoad,
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
