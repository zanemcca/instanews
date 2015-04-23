

var app = angular.module('instanews.camera', ['ionic', 'ngResource']);

app.factory('Camera', [
      '$q',
      function($q) {

   var options = {
      correctOrientation: true
   };


   var captureVideo = function() {
      var q = $q.defer();

      if (!navigator.device.capture) {
         q.resolve(null);
         return q.promise;
      }

      navigator.device.capture.captureVideo( function (videoData) {
         q.resolve(videoData);
      }, function (err) {
         q.reject(err);
      }, options);

      return q.promise;
   };

   var capturePicture = function(options) {
      var q = $q.defer();

      if (!navigator.device.capture) {
         q.resolve(null);
         return q.promise;
      }

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    };

  return {
    getPicture: capturePicture,
    getVideo: captureVideo
  };
}]);
