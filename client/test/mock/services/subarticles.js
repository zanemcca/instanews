

angular.module('mock.services.subarticles', []).service('Subarticles', function() {
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
        getLoader: function (spec) {
          return {
            more: function (num, cb) {
              cb() 
            } 
          };
        },
        get: function () {
          return [1];
        },
        reload: function () {},
        unfocusAll: function () {},
        load: function () {
        }
      };
    },
    getSpec: function () {},
    deleteAll: function() {},
    get: function(id) {
      return [1,2,3];
    }
  };
});
