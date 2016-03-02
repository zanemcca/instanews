
'use strict';
var app = angular.module('instanews.service.list', ['ionic', 'ngCordova']);

function ListFactory (Platform, User) {
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

    // The default sorting algorithm moves items with the enableFocus flag to the top
    // Sorts the items in the list
    var sortingFunction = function(a,b) {
      if(a.enableFocus && b.enableFocus) {
        return 0;
      } else if(a.enableFocus) {
        return -1;
      } else if(b.enableFocus) {
        return 1;
      } else {
        return b.rating - a.rating;
      }
    };

    // Add or update items in the list
    var add = function (newItems, cb) {
      if(!Array.isArray(newItems)) {
        newItems = [newItems];
      }

      newItems = spec.addFilter(newItems);

      if(newItems.length) {

        newItems.forEach(function (newItem) {
          // Enable the flag if any items are flagged with 'enableFocus'
          if(newItem.enableFocus) {
            that.enableFocus = true;
          }

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

            newItem.showOptions = function() {
              var options = {
                buttons: [
                  { text: '<i class="icon ion-ios-information-outline positive"></i> Report an issue'}
                ],
                titleText: 'What would you like to do?',
                cancelText: 'Cancel',
                buttonClicked: function (idx) {
                  if(idx === 0) {
                    Platform.support.clearData();
                    Platform.support.addData('inst', newItem);
                    Platform.support.showConversations();
                  } else {
                    console.log('Unknown button index: ' + idx);
                  }
                  return true;
                }
              };

              if(User.isMine(newItem) || User.isAdmin()) {
                options.destructiveText = '<i class="icon ion-trash-b assertive"></i> Delete this item';
                options.destructiveButtonClicked = function() {
                  newItem.destroy();
                  return true;
                };
              }

              Platform.showSheet(options);
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
              spec.options.filter.limit = 10; 
              /*
              spec.options.filter.limit *= 2;  
              spec.options.filter.limit = Math.min(spec.options.filter.limit, 100);
             */
              modified = true;
              cb(items);
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
            cb();
          } else {
            return;
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

    var unfocusAll = function () {
      spec.items.forEach(function(item) {
        delete item.enableFocus;
      });
      spec.items.sort(spec.sortingFunction);
      that.enableFocus = false;
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

    var reload = function (cb) {
      spec.options.filter.skip = 0;
      spec.options.filter.limit = Math.max(get().length + 1, defaultLimit);
      load(function (items) {
        if(spec.items.length) {
          spec.items = [];
        }

        if(items && items.length) {
          add(items, cb);
        } else {
          notifyObservers();
          if(cb) {
            cb();
          }
        }
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
    spec.reload = spec.reload || function () {};
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
    var defaultLimit =  spec.options.filter.limit || 5;
    spec.options.filter.limit = defaultLimit;

    for(var i in spec.options.filter) {
      ogFilter[i] = spec.options.filter[i];
    }

    // New
    spec.items = [];
    spec.enableFocus = false;
    spec.observerCallbacks = [];
    spec.itemsAvailable = false;

    // That is the object to be constructed
    // it has privlidged access to my, and spec
    that = {
      get: get, 
      clear: clear,
      getTop: getTop, 
      findById: findById,
      focusById: focusById,
      unfocusAll: unfocusAll,
      enableFocus: spec.enableFocus, 
      load: function (cb) {
        load( function(items) {
          if(items && items.length) {
            add(items, cb);
          } else if(cb) {
            cb(get());
          } else {
            return get();
          }
        });
      },
      reload: reload,
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
  'User',
  ListFactory
]);
