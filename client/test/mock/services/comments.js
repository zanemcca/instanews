

angular.module('mock.services.comments', []).service('Comments', function() {
  return {
    load: function(id, cb) {
      cb();
    },
    registerObserver: function(cb) {
      cb();
    },
    unregisterObserver: function() {},
    findOrCreate: function () {
      return {
        getSpec: function () {
          return { 
            options: {
              filter: {}
            }
          };
        },
        load: function () {},
        unfocusAll: function () {}
      };
    },
    getSpec: function () {},
    deleteAll: function() {},
    get: function(id) {
      return [1,2,3];
    }
  };
});
