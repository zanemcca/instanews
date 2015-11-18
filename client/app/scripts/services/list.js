
'use strict';
var app = angular.module('instanews.service.list', ['ionic', 'ngCordova']);

function ListFactory (Platform) {
  // Initialization function
  // Find: Loopback find command for the model 
  // Update: Takes in the new and old value of the model that is being updated
  //        It must update the item inplace  to avoid extra computation
  // Options: The query to be passed to the find command. The limit amount is automatically
  //        taken care of. To reset perform a load with Options.filter.skip = 0;
  var init = function (find, update, addFilter, options) {
    this._Find = find;
    this._AddFilter = addFilter;
    this._Update = update;
    this._Options = options;
    // Ensure the find filter is initialized
    if(!this._Options) {
      this._Options = {};
    }
    if(!this._Options.filter) {
      this._Options.filter = {};
    }
    if(!this._Options.filter.limit) {
      this._Options.filter.limit = 5;
    }
  };

  // Items are initially not available
  var itemsAvailable = false;

  // Retreives the list of items
  var get = function () {
    return this._items;
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

    newItems = this._AddFilter(newItems);

    if(newItems.length) {
      var self = this;
      newItems.forEach(function (newItem) {
        var update = false;
        for(var i = self._items.length - 1; i >= 0; i--) {
          if(self._items[i].id === newItem.id) {
            self._Update(newItem, self._items[i]);
            update = true;
            break;
          }
        }
        if(!update) {
          self._items.push(newItem);
        }
      });
      self._items.sort(sortingFunction);
      self.notifyObservers();
    } else {
      console.log('No items pased to list.add');
    }

    if(cb) {
      cb(this.get());
    } else {
      return this.get();
    }
  };

  // Load more items using the given Find function
  var load = function (cb) {
    var self = this;
    if(!self._Options.filter.skip) {
      itemsAvailable = true;
      self._Options.filter.limit = 5;
    } else {
      self._Options.filter.skip = self._items.length;
    }

    Platform.ready
    .then( function () {
      if(self._Find instanceof Function) {
        /* TODO Take into account fringe cases where content crosses pages.
         * Only dealing with duplicates for the moment
         */
        self._Find(self._Options).$promise.then(function (items) {
          if(!items || !items.length) {
            itemsAvailable = false;
            self.add([], cb);
          } else {
            self._Options.filter.limit *= 2;  
            self.add(items, cb);
          }
        }, function (err) {
          console.log('Failed to load more items!');
          console.log(err);
          self.add([], cb);
        });
      } else {
        console.log('Invalid find function!');
        self.add([], cb);
      }
    });
  };

  // Remove a subset based on a comparison function
  var remove = function (comparator, idx) {
    var self = this;
    var removed = [];
    var remaining = [];
    self._items.forEach(function (item) {
      if(comparator(item)) {
        removed.push(item);
      } else {
        remaining.push(item);
      }
    });

    if(removed.length) {
      self._items = remaining;
      self.notifyObservers();
    }
    return removed;
  };

  // Find by id
  var findById = function (id) {
    for(var i in this._items) {
      if(this._items[i].id === id) {
        return this._items[i];
      }
    }
  };

  // Register and notify observers of the list
  var registerObserver = function(cb) {
    this._observerCallbacks.push(cb);
  };
  var notifyObservers = function() {
    var self = this;
    angular.forEach(self._observerCallbacks, function(cb) {
      cb();
    });
  };

  var List = {
    _items: [], 
    _Find: function () {},
    _Update: function (newVal, oldVal) {},
    _AddFilter: function (input) { return input;},
    _Options: {}, 
    _observerCallbacks: [],
    init: init,
    get: get, 
    findById: findById,
    load: load, 
    add: add,
    remove: remove,
    registerObserver: registerObserver,
    notifyObservers: notifyObservers,
    areItemsAvailable: function () {
      return itemsAvaialble;
    }
  };

  return List;
}

app.factory('List', [
  'Platform',
  ListFactory
]);
