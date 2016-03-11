
'use strict';
var app = angular.module('instanews.service.imageCache', []);

app.factory('ImageCache', ['$q', function($q) {
  return {
    Cache: function(urls) {
      if(!urls) {
        return $q.reject('Input is invalid');
      }

      if (!Array.isArray(urls)) {
        if(typeof urls !== 'string') {
          return $q.reject('Input must be a string or an array of strings');
        } else {
          urls = [urls];
        }
      }

      var promises = [];

      var onload = function(deferred) {
        return function(){
          deferred.resolve();
        };
      };

      var onerror = function(deferred,url) {
        return function(){
          deferred.reject(url);
        };
      };

      for (var i = 0; i < urls.length; i++) {
        var deferred = $q.defer();
        var img = new Image();

        img.onload = onload.call(this, deferred);

        img.onerror = onerror.call(this, deferred, urls[i]);

        promises.push(deferred.promise);
        img.src = urls[i];
      }

      return $q.all(promises);
    }
  };
}]);
