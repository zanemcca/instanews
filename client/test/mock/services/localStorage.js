
angular.module('mock.services.localStorage', []).service('LocalStorage', function() {
  var value;
  return {
    secureWrite: function(key, val) {
      value = val;
    },
    secureRead: function(key, cb) {
      cb(null, value);
    },
  };
});
