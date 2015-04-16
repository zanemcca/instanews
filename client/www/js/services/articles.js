
var app = angular.module('instanews.articles', ['ionic', 'ngResource','ngCordova']);

app.service('Articles', [
      '$filter',
      'Article',
      function(
         $filter,
         Article){

   var articles = [];

   //Getters
   var getOne = function (id) {
      var val = $filter('filter')(articles, {myId: id});
      if (val.length > 0) {
         return val[0];
      }
   };

   var get = function() {
      return articles;
   };

   var set = function(arts) {
      articles = arts;
      notifyObservers();
   };

   var observerCallbacks = [];

   var registerObserver = function(cb) {
      observerCallbacks.push(cb);
   };

   var notifyObservers = function() {
      angular.forEach(observerCallbacks, function(cb) {
         cb();
      });
   };

   return {
      get: get,
      set: set,
      registerObserver: registerObserver,
      getOne: getOne
   };
}]);
