var app = angular.module('instanews.feed', ['ionic', 'ngResource','ngAutocomplete']);

app.controller('FeedCtrl', [
      '$scope',
      '$ionicModal',
      '$location',
      'Article',
      'Common',
      'Comment',
      'Post',
      function($scope,
         $ionicModal,
         $location,
         Article,
         Common,
         Comment,
         Post) {

   $scope.user = Common.user.user;
   $scope.articles = [];

   var loadLimit = 10;
   $scope.onRefresh = function () {
      var filter = {
         limit: loadLimit,
         include: {
            relation: 'subarticles',
            scope: {
               limit: 1,
               order: 'rating DESC'
            }
         },
         order: 'rating DESC'
      }

      Article.find({filter: filter })
      .$promise
      .then( function (res) {
         $scope.articles = res;

         for( var i = 0; i < $scope.articles.length; i++) {
            var article = $scope.articles[i];
            if (article.subarticles.length > 0) {
               article.topSub = article.subarticles[0];
            }
         }

         Common.setArticles(res);

         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   $scope.onRefresh();

   //TODO load more server side using session management
   $scope.loadMore = function() {
      console.log('No more articles');
      $scope.itemsAvailable = false;
      $scope.$broadcast('scroll.infiniteScrollComplete');
   };

   $scope.useMyLocation = function() {
      //TODO Change this to lookup the name of the user location
      $scope.newArticle.search = 'My Location';
   };

   $scope.newArticle = {
      title: '',
      search: ''
   };

   var autocomplete;
   $scope.$on('modal.shown', function(modal) {
      //TODO Add data-tap-disabled='true' to pac-container class. I think that should
      //solve the long press required on the google maps autocomplete

      /*
      // My implementation of the autocomplete
      autocomplete = new google.maps.places.Autocomplete(document.getElementById('placeSearch'));
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
         $scope.newArticle.place = autocomplete.getPlace();
      });
      */
   });

   $scope.trashArticle = function() {
      $scope.newArticle.title = '';
      $location.path('/feed');
   };

   $scope.postArticle = function() {
      Post.article($scope.user.username, $scope.newArticle, function(res) {
         $scope.articles.push(res);
         $scope.trashArticle();
      });
   };

}]);
