

angular.module('mock.services.uploads' ,[]).service('Uploads', function() {
  return {
    findOrCreate: function(id) {
      return {
        get: function() {
          return uploads;
        },
        registerObserver: function (cb) {
          return {
            unregister: function () {
              cb();
            }
          };
        }
      };
    }
  };
});
