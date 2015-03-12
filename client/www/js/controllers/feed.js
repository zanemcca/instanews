var app = angular.module('instanews.feed', ['ionic', 'ngResource']);

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
      posSearch: '',
      posName: ''
   };

   $ionicModal.fromTemplateUrl('templates/postArticleModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then( function (modal) {
      $scope.postArticleModal = modal;
   });

   $scope.trashArticle = function() {
      $scope.newArticle.title = '';
      $scope.postArticleModal.hide();
   };

   $scope.useMyLocation = function() {
      //TODO Change this to lookup the name of the user location
      $scope.newArticle.posName = 'My Location';
   };

   $scope.postArticle = function() {
      if ( $scope.newArticle.posSearch ) {
         //TODO Lookup the lat-lng
         $scope.newArticle.posName = 'My Location';
         loc = {
            lat: Common.mPosition.lat,
            lng: Common.mPosition.lng
         }
      }
      else {
         $scope.newArticle.posName = 'My Location';
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
