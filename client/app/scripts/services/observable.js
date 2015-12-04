
'use strict';
var app = angular.module('instanews.service.observable', []);

function ObservableFactory() {
  var observerable = function (spec) {
    var that;
    spec = spec || {};
    spec.observerCallbacks = spec.observerCallbacks || [];

    var id = 0;

    function observer(cb) {
      var that;

      //TODO Test unregister
      var unregister = function () {
        for(var i = 0; i < spec.observerCallbacks.length; i++) {
          if(spec.observerCallbacks[i].id === that.id) {
            return spec.observerCallbacks.splice(i,1);
          }
        }
      };

      that = {
        id: id,
        cb: cb,
        unregister: unregister
      };

      spec.observerCallbacks.push(that);

      id++;

      return that;
    }

    // Register and notify observers of the list
    var registerObserver = function(cb) {
      return observer(cb);
    };

    var notifyObservers = function() {
      angular.forEach(spec.observerCallbacks, function(observer) {
        observer.cb();
      });
    };

    // That is the object to be constructed
    // it has privlidged access to my, and spec
    that = {
      registerObserver: registerObserver,
      notifyObservers: notifyObservers
    };

    return that;
  };

  return observerable;
}

app.factory('observable', [
  ObservableFactory
]);
