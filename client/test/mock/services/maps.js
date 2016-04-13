

angular.module('mock.services.maps', []).service('Maps', function() {
  return {
    getArticleMap: function() {
      return {
        map: 'I am map'
      };
    },
    registerObserver: function(cb) {
      return {
        unregister: function () {
          //cb();
        }
      };
    },
    setMarker: function(map, position) {
      return {
        name: 'marker'
      };
    },
    deleteMarker: function(marker) {},
    localize: function() {
    }
  };
});
