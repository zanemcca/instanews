
'use strict';
var app = angular.module('instanews.service.list', ['ionic', 'ngCordova']);

function ListFactory (observable, Platform, PreloadQueue, User) {
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

    //Focus object
    //TODO add all focus logic to this object
    var focus = observable();

    // Add or update items in the list
    var add = function (items, newItems, cb) {
      if(!Array.isArray(newItems)) {
        newItems = [newItems];
      }

      var err;
      newItems = spec.addFilter(newItems);

      if(newItems.length) {

        var shouldEnableFocus = false;
        newItems.forEach(function (newItem) {
          // Enable the flag if any items are flagged with 'enableFocus'
          if(newItem.enableFocus) {
            shouldEnableFocus = true;
          }

          var update = false;
          for(var i = items.length - 1; i >= 0; i--) {
            if(items[i].id === newItem.id) {
              spec.update(newItem, items[i]);
              update = true;
              break;
            }
          }
          if(!update) {
            //TODO Change to one style to keep a consistent format 
            newItem.focus = spec.focus.bind(newItem);
            newItem.save = spec.save.bind(newItem);
            newItem.preLoad = spec.preLoad.bind(this, newItem);
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
            items.push(newItem);
          }
        });

        if(items === spec.items) {
          spec.items.sort(spec.sortingFunction);
          spec.options.filter.skip = spec.items.length;
          notifyObservers();
        }

        if(shouldEnableFocus) {
          that.enableFocus = true;
          if(items === spec.items) {
            focus.notifyObservers();
          }
        }
      } else {
        console.log('No items pased to list.add');
        err = new Error('Empty list being added');
      }

      if(cb) {
        cb(err, get());
      } else {
        if(err) {
          return err;
        } else {
          return get();
        }
      }
    }; 

    // Load more items using the given Find function
    var load = function (cb) {
      /*
      if(!spec.options.filter.skip) {
        spec.itemsAvailable = true;
        //spec.options.filter.limit = ogFilter.limit;
      }
      */

     cb = cb || function () {};

      Platform.ready
      .then( function () {
        if(spec.find instanceof Function) {
          /* TODO Take into account fringe cases where content crosses pages.
           * Only dealing with duplicates for the moment
           */
          spec.find(spec.options).$promise.then(function (items) {
            if(!items || !items.length) {
              spec.itemsAvailable = false;
              cb();
            } else {
              if(items.length < spec.options.filter.limit) {
                spec.itemsAvailable = false;
              } else {
                spec.itemsAvailable = true;
              }
              spec.options.filter.limit = 10; 
              /*
              spec.options.filter.limit *= 2;  
              spec.options.filter.limit = Math.min(spec.options.filter.limit, 100);
             */
              cb(null, items);
            }
          }, function (err) {
            console.log('Failed to load more items!');
            console.log(err);
            cb(err);
          });
        } else {
          console.log('Invalid find function!');
          cb(new Error('Invalid find function!'));
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
      focus.notifyObservers();
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
      spec.options.filter.limit = spec.options.filter.limit || defaultLimit;
      load(function (err, items) {
        if(err) {
          return console.log(err);
        }

        if(spec.items.length) {
          spec.items = [];
        }

        if(items && items.length) {
          that.add(items, cb);
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

    //TODO Use pendingLoad to avoid multiple load requests
    var pendingLoad = false;

    var getLoader = function (lSpec) {
      lSpec = lSpec || {};
      lSpec.preload = lSpec.preload || false;
      lSpec.keepSync = lSpec.keepSync || false;

      lSpec.onItemFocus = lSpec.onItemFocus || function() {
        loader.enableFocus = that.enableFocus;
        if(that.enableFocus) {
          loader.sync();
        }
        //TODO Maybe we should sync after disable as well
        //The only problem is unfocusAll is called a lot I think.
        //Investigate it.
      };

      lSpec.filter = lSpec.filter || function(items) {
        return items;
      };

      lSpec.items = [];

      var more = function (rate, cb) {
        cb = cb || function () {};
        var items = [];
        if(lSpec.items.length + rate <= get().length) {
          items = getSegment(lSpec.items.length + rate);
          if(lSpec.preload) {
            preloadItems(items);
          } else {
            lSpec.items = items;
          }
          cb(null, lSpec.items);
        } else if(pendingLoad) {
          //TODO register an observer for the the completion of the load
          cb(null, loader.get());
        } else if(areItemsAvailable()) {
          spec.options.filter.limit = Math.max(rate, 50);
          console.log('Loading ' + spec.options.filter.limit + ' more!');
          spec.options.filter.skip = lSpec.items.length;
          that.load(function(err) {
            if(err) {
              console.log('Failed to load more!');
              return cb(err);
            }

            items = getSegment(lSpec.items.length + rate);
            if(lSpec.preload) {
              preloadItems(items);
            } else {
              lSpec.items = items;
            }
            cb(null, lSpec.items);
          });
        } else {
          items = getSegment(get().length);
          if(lSpec.preload) {
            preloadItems(items);
          } else {
            lSpec.items = items;
          }
          cb(null, lSpec.items);
        }
      };

      var preloadItems = function (items) {
        var done = function (item) {
          /*
          console.log('QueueAvg: ' + Math.round(PreloadQueue.stats.queueDelay) +
                      '\tLoadAvg: ' + Math.round(PreloadQueue.stats.loadDelay) +
                      '\tQueueLength: ' + PreloadQueue.stats.getLength());*/

          var items = lSpec.filter([item]);
          if(items.length) {
            add(lSpec.items, items, function(err) {
              if(err) {
                console.log('Failed to add preloaded item');
              }
            });
          } else {
            console.log('Item ' + item.id + ' was filtered after preloading');
          }
        };

        var error = function (err) {
          if(err !== 'flush') {
            console.log('Failed to preload the item!');
            console.log(err);
          }
        };

        for(var i in items) {
          if(!items[i].preloaded) {
            items[i].preLoad = preLoad.bind(this, items[i]);
            PreloadQueue.add(items[i]).then(done, error);
          } else {
            done(items[i]);
          }
        }
      };

      var getSegment = function (size) {
        var items = get();
        if(items.length > size) { 
          return items.slice(0, size);
        } else {
          return items.slice();
        }
      };

      var loader = {
        enableFocus: that.enableFocus,
        add: function(newItems, cb) {
          if(lSpec.preload) {
            preloadItems(newItems);
            cb(null, lSpec.items);
          } else {
            var items = lSpec.filter(newItems);
            if(items.length) {
              if(items.length < newItems.length) {
                var filtered = newItems.length - items.length;
                console.log(filtered + ' items were filtered during adding');
              }
              add(lSpec.items, items, cb);
            } else {
              console.log(newItems.length + 'items were filtered during adding');
              cb(null, lSpec.items);
            }
          }
        }, 
        reload: function(cb) {
          reload(function (err) {
            cb = cb || function () {};
            if(err) {
              console.log('Failed to reload!');
              return cb(err);
            }
            loader.sync();
            cb(null, lSpec.items);
          });
        },
        sync: function() {
          var items = getSegment(Math.max(10, lSpec.items.length));
          console.log('Synchronizing: ' + items.length);
          lSpec.items = [];

          if(lSpec.preload) {
            preloadItems(items);
          } else {
            lSpec.items = items;
          }
          return lSpec.items;
        },
        get: function () {
          return lSpec.items;
        },
        areItemsAvailable: function () {
          return (areItemsAvailable() || lSpec.items.length < get().length);
        },
        preLoad: preLoad,
        more: more
      };

      if(lSpec.keepSync) {
        //TODO Clear observer
        registerObserver(loader.sync);
      }

      focus.registerObserver(lSpec.onItemFocus);

      return loader;
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
      getLoader: getLoader,
      get: get, 
      clear: clear,
      getTop: getTop, 
      findById: findById,
      focusById: focusById,
      unfocusAll: unfocusAll,
      enableFocus: spec.enableFocus, 
      load: function (cb) {
        load( function(err, items) {
          if(err) {
            if(cb) {
              cb(err);
            } else {
              console.log(err);
            }
            return;
          }

          if(items && items.length) {
            that.add(items, cb);
          } else if(cb) {
            cb(null, get());
          }
        });
      },
      reload: reload,
      add: function(newItems, cb) {
        add(spec.items, newItems, cb);
      },
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
  'observable',
  'Platform',
  'PreloadQueue',
  'User',
  ListFactory
]);
