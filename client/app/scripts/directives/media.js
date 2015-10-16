
'use strict';
var app = angular.module('instanews.directive.media', [
  'ionic',
  'ngResource',
  'com.2fdevs.videogular',
  'com.2fdevs.videogular.plugins.controls',
  'com.2fdevs.videogular.plugins.overlayplay',
  'com.2fdevs.videogular.plugins.buffering',
  'com.2fdevs.videogular.plugins.poster'
]);

//This directive will display media in a preview format
app.directive(
  'inmediapreview', [
    function () {

      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        controller: function() {
        },
        templateUrl: 'templates/directives/mediaPreview.html'
      };
    }]
);

app.controller(
  'videoCtrl', [
    '$scope',
    '$sce',
    'ENV',
    'Platform',
    function ($scope, $sce, ENV, Platform) {

      var getUrl = function(container, fileName) {
        var urlBase = ENV.apiEndpoint;
        return urlBase + '/storages/' + container + '/download/' + fileName;
      };

      console.log($scope.media);
      $scope.sources = [];
      for(var i in $scope.media.sources) {
        var src = $scope.media.sources[i];
        if(src.indexOf('.m3u8') > -1) {
          if(Platform.isIOS()) {
            $scope.sources.push({
              src: getUrl($scope.media.container, src),
              type: 'application/vnd.apple.mpegURL'
            });
          }
        } else {
          $scope.sources.push({
            src: getUrl($scope.media.container, src),
            type: 'video/mp4'
          });
        }
      }

      $scope.poster = getUrl('instanews.thumbnails', $scope.media.poster);

      $scope.config = {
        preload: "none",
        plugins: {
          controls: {
            autoHide: true,
            autoHideTime: 3000
          }
        }
      };
    }]
);


//This directive will display subarticle media in a consumable format
app.directive(
  'inmedia', [
    '$compile',
    function ($compile) {

      return {
        restrict: 'E',
        scope: {
          media: '='
        },
        templateUrl: 'templates/directives/media.html'
      };
    }]
);
