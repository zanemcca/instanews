'use strict';

var app = angular.module('instanews.controller.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
  '$ionicModal',
  '$scope',
  '$stateParams',
  'Article',
  'Articles',
  'Comments',
  'Subarticles',
  'Maps',
  'Navigate',
  'Post',
  'Platform',
  'Uploads',
  function(
    $ionicModal,
    $scope,
    $stateParams,
    Article,
    Articles,
    Comments,
    Subarticles,
    Maps,
    Navigate,
    Post,
    Platform,
    Uploads
  ) {

    Platform.initBackButton();

    $scope.Platform = Platform;
    $scope.Subarticles = Subarticles.findOrCreate($stateParams.id);
    $scope.Uploads = Uploads.findOrCreate($stateParams.id);
    $scope.uploads = [];

    var spec = $scope.Subarticles.getSpec();
    spec.options.filter.limit = 5;
    spec.options.filter.skip = 0;
    $scope.Subarticles.load();

    $scope.article = {
      modelName: 'article',
      id: $stateParams.id
    };

    var setMarker = function (map, location) {
      /* istanbul ignore else */
      if(map && location) { 
        marker = Maps.setMarker(map,location);
      } else {
        console.log('Failed to set the marker');
      }
    };

    var articleComments = Comments.findOrCreate('article',$stateParams.id);

    var afterLoaded = function () {
      var map = Maps.getArticleMap();
      /* istanbul ignore else */
      if(map && $scope.article.location) { 
        setMarker(map, $scope.article.location);
        Platform.loading.hide();
        mapObserver.unregister();
      }
    };

    var mapObserver = Maps.registerObserver(afterLoaded);

    //Scope variables
    Articles.findById($stateParams.id ,function (article) {
      if(!article) {
        Platform.showToast('404: The article you were looking for is missing!');
      }
      $scope.article = article;
      afterLoaded();
    });

    $scope.map = {
      id: 'articleMap'
    };

    var marker;
    var uploadObserver;

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      afterLoaded();
      var map = Maps.getArticleMap();
      if(map) {
        google.maps.event.trigger(map, 'resize');
      }
      $scope.Subarticles.reload();

      uploadObserver = $scope.Uploads.registerObserver(function () {
        var uploads = $scope.Uploads.get();
        $scope.uploads = uploads;
        if(uploads.length > 0) {
          var noFile = true;
          uploads.forEach(function (upload) {
            noFile = noFile && upload.noFile;
          });
          if(!noFile) {
            $scope.uploadModal.show();
          } else {
            $scope.post();
          }
        } else {
          if($scope.uploadModal) {
            $scope.uploadModal.hide();
          }
        }
      });
    });

    $scope.$on('$ionicView.afterLeave', function() {
      marker = Maps.deleteMarker(marker);
      uploadObserver.unregister();
      articleComments.unfocusAll();
      $scope.Subarticles.unfocusAll();
    });

    //TODO Remove this and the template that goes with it
    $scope.post = function () {
      Navigate.go('app.subarticlePost', {
        id: $scope.article.id
      });
    };

    $scope.onRefresh = function () {
      console.log('Refresh');
      $scope.Subarticles.unfocusAll();
      $scope.Subarticles.reload(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $ionicModal.fromTemplateUrl('templates/modals/upload.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then( function (modal) {
      $scope.uploadModal = modal;
      $scope.post = function (){
        Post.post($scope.Uploads, $stateParams.id, function (err) {
          if(!err) {
            modal.hide();
          } else {
            console.log(err);
          }
        });
      };

      $scope.isPosting = function () {
        return Uploads.isPending($stateParams.id);
      };

      $scope.clear = function () {
        $scope.Uploads.clear();
        modal.hide();
      };
    });
  }
]);

