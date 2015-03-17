var app = angular.module('instanews.feed', ['ionic', 'ngResource','ngAutocomplete']);

app.controller('FeedCtrl', [
      '$scope',
      '$ionicModal',
      'Article',
      'Common',
      'Comment',
      function($scope,
         $ionicModal,
         Article,
         Common,
         Comment) {

   $scope.articles = Common.articles;
   $scope.user = Common.user.user;

   $scope.onRefresh = function () {
      Article.find( function (res) {
         $scope.articles = res;
         $scope.$broadcast('scroll.refreshComplete');
      });
   };

   $scope.newArticle = {
      title: '',
      search: ''
   };

   $ionicModal.fromTemplateUrl('templates/postArticleModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.postArticleModal = modal;
   });

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
      $scope.postArticleModal.hide();
   };

   $scope.useMyLocation = function() {
      //TODO Change this to lookup the name of the user location
      $scope.newArticle.search = 'My Location';
   };



   $scope.postArticle = function() {
      if ( $scope.newArticle.search ) {
         //TODO Lookup the lat-lng
         $scope.newArticle.search = 'My Location';
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      else {
         $scope.newArticle.search = 'My Location';
         loc = $scope.newArticle.place.
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      Article.create({
         date: Date.now(),
         isPrivate: false,
         myId: Math.floor(Math.random()*Math.pow(2,32)),
         location: loc,
         _votes: {
            up: Math.floor(Math.random()*100),
            down: Math.floor(Math.random()*50),
            lastUpdated: Date.now()
         },
         username: $scope.user.username,
         title: $scope.newArticle.title
      })
      .$promise.then( function(res) {
         $scope.articles.push(res);
      });
      $scope.trashArticle();
   };

}]);
