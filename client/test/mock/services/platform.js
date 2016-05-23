

angular.module('mock.services.platform', []).service('Platform', function() {
  return {
    loading: {
      show: function () {},
      hide: function () {}
    },
    analytics: {
      trackView: function () {},
      trackEvent: function () {},
      trackException: function () {}
    },
    url: {
      getId: function (item) {
        return item;
      }
    },
    showAlert: function () {},
    initBackButton: function() {},
    isBrowser: function() {},
    isAndroid6: function () {
      return false;
    },
    ready: {
      then: function (cb) {
        cb();
      }
    },
    getUUID: function () {
      return 'uuid';
    },
    isIOS: function() {
      return true;
    },
  };
});
