
angular.module('mock.services.articles', []).service('Articles', function() {
  return {
    get: function() {
      return [];
    },
    add: function(articles) {},
    findById: function(articles) {},
    deleteAll: function() {},
    areItemsAvailable: function() {
      return true;
    },
    load: function(cb) {
      cb();
    },
    registerObserver: function(cb) {}
  };
});
