

angular.module('mock.services.platform', []).service('Platform', function() {
  return {
    loading: {
      show: function () {},
      hide: function () {}
    },
    analytics: {
      trackView: function () {},
      trackEvent: function () {},
    },
    initBackButton: function() {},
    isIOS: function() {
      return true;
    },
  };
});
