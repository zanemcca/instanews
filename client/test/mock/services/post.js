

angular.module('mock.services.post', []).service('Post', function() {
  return {
    post: function(uploads, cb) {
      cb();
    },
  };
});
