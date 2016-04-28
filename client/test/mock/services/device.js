

angular.module('mock.services.device', []).service('Device', function() {
  return {
    isBrowser: function() {},
    isAndroid6: function () {
      return false;
    },
    getUUID: function () {
      return 'uuid';
    },
    isIOS: function() {
      return true;
    },
  };
});
