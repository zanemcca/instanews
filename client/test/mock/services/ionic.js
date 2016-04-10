
angular.module('mock.services.ionic', []).service('$ionicModal', function($q) {
  return {
    fromTemplateUrl: function(uri, obj) {
      deferred = $q.defer()
      return deferred.promise;
    }
  };
});
