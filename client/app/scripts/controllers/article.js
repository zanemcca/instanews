'use strict';

var app = angular.module('instanews.controller.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
  '$ionicModal',
  '$scope',
  '$stateParams',
  'Article',
  'Articles',
  'Comments',
  'preload',
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
    preload,
    Subarticles,
    Maps,
    Navigate,
    Post,
    Platform,
    Uploads
  ) {

    Platform.initBackButton();

    $scope.Platform = Platform;
    var Subs = Subarticles.findOrCreate($stateParams.id);
    $scope.Subarticles = Subs.getLoader({
      preload: true
    });

    $scope.Uploads = Uploads.findOrCreate($stateParams.id);
    $scope.uploads = [];

    $scope.preScrollToTop = function (cb) {
      Preload.stop();
      cb();
      Preload.reset();
    };

    var Preload = preload({
      scrollHandle: 'subarticle',
      //$timeout: $timeout,
      list: $scope.Subarticles
    });

    var spec = Subs.getSpec();

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
      var map = Maps.getArticleMap($stateParams.id);
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


    $scope.$on('$ionicView.unloaded', function () {
      console.log('Destroying article view!');
      Maps.deleteArticleMap($stateParams.id);
    });

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      Preload.start();
      afterLoaded();
      var map = Maps.getArticleMap($stateParams.id);
      if(map) {
        google.maps.event.trigger(map, 'resize');
      }

      spec.options.filter.limit = Math.max(Subs.get(), 100);
      spec.options.filter.skip = 0;
      Subs.load(function (err) {
        if(err) {
          console.log(err);
        } else {
          $scope.Subarticles.sync();
        }
      });

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

      Platform.analytics.trackView('Article View');
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Preload.stop();
    });

    $scope.$on('$ionicView.afterLeave', function() {
      marker = Maps.deleteMarker(marker);
      uploadObserver.unregister();
      articleComments.unfocusAll();
      Subs.unfocusAll();
    });

    //TODO Remove this and the template that goes with it
    $scope.post = function () {
      Navigate.go('app.subarticlePost', {
        id: $scope.article.id
      });
    };

    $scope.onRefresh = function () {
      console.log('Refresh');
      Subs.unfocusAll();
      $scope.Subarticles.reload( function (err) {
        if(err) { 
          console.log(err);
        }
        $scope.$broadcast('scroll.refreshComplete');
      });

      spec.options.filter.limit = Math.max(Subs.get(), 100);
      spec.options.filter.skip = 0;
      Subs.load(function (err) {
        if(err) {
          console.log(err);
        } else {
          $scope.Subarticles.sync();
          $scope.$broadcast('scroll.refreshComplete');
        }
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

