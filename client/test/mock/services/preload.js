

angular.module('mock.services.preload', []).service('preload', function() {
  return function () {
    return {
      reset: function () {},
      start: function () {},
      stop: function () {}
    };
  };
});
