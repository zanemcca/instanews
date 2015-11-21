'use strict';

var app = angular.module('instanews.controller.article', ['ionic', 'ngResource']);

app.controller('ArticleCtrl', [
  '$scope',
  '$stateParams',
  'Article',
  'Articles',
  'Subarticles',
  'Maps',
  function(
    $scope,
    $stateParams,
    Article,
    Articles,
    Subarticles,
    Maps
  ) {

    $scope.Subarticles = Subarticles.findOrCreate($stateParams.id);

    var spec = $scope.Subarticles.getSpec();
    spec.options.filter.limit = 5;
    spec.options.filter.skip = 0;
    $scope.Subarticles.load();

    //Scope variables
    $scope.article = Articles.findById($stateParams.id);

    $scope.map = {
      id: 'articleMap'
    };

    var marker;

    //Refresh the map everytime we enter the view
    $scope.$on('$ionicView.afterEnter', function() {
      var map = Maps.getArticleMap();
      /* istanbul ignore else */
      if(map) {
        marker = Maps.setMarker(map,$scope.article.location);
      }
    });

    $scope.$on('$ionicView.afterLeave', function() {
      marker = Maps.deleteMarker(marker);
    });

    /*
       $scope.onRefresh = function () {
       console.log('Refresh');
       Subarticles.deleteAll($stateParams.id);
       Subarticles.load($stateParams.id, function() {
       $scope.$broadcast('scroll.refreshComplete');
       });
       };
       */

  }]);

