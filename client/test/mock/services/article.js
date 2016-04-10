
angular.module('mock.services.article', []).service('Article', function() {
  return {
    find: function(filter) {
      console.log('Article find');
      return art;
    },
  };
});
