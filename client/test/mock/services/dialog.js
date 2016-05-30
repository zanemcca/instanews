

angular.module('mock.services.dialog', []).service('Dialog', function() {
  return {
    alert: function () {},
    confirm: function (text, title, buttonNames, cb) {
      cb(1);
    }
  };
});
