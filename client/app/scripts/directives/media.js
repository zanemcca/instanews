
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

// Video controller
app.controller(
  'videoCtrl', [
    '$scope',
    '$sce',
    'ENV',
    'Platform',
    function ($scope, $sce, ENV, Platform) {

      var getUrl = function(container, fileName) {
        if(fileName.indexOf('file://') === 0) {
          return fileName;
        } else {
          var url = ENV.videoEndpoint;
          url += '/' + fileName;
          return url;
        }
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

      if($scope.media.poster) {
        $scope.poster = getUrl($scope.media.container, $scope.media.poster);
      }

      $scope.config = {
        preload: 'none',
        plugins: {
          controls: {
            autoHide: true,
            autoHideTime: 3000
          }
        }
      };
    }]
);

app.controller(
  'imageCtrl', [
    '$scope',
    'ENV',
    function ($scope, ENV) {

      var urlBase = ENV.photoEndpoint;

      var getUrl = function(container, fileName) {
        if(fileName.indexOf('file://') === 0) {
          return fileName;
        } else {
          return urlBase + '/' + fileName;
        }
      };

      console.log($scope.media);
      var src = $scope.media.source;
      if(!src) {
        src= $scope.media.name;
      }
      if($scope.media.poster) {
        urlBase = ENV.videoEndpoint;
        src = $scope.media.poster;
      }

      $scope.source = getUrl($scope.container, src);
    }]
);

//This directive will display subarticle media in a consumable format
app.directive(
  'inmedia', [
    function () {

      return {
        restrict: 'E',
        scope: {
          media: '='
        },
        templateUrl: 'templates/directives/media.html'
      };
    }]
);

//This directive will display media in a preview format
app.directive(
  'inmediapreview', [
    function () {

      return {
        restrict: 'E',
        scope: {
          media: '='
        },
        controller: function() {
        },
        templateUrl: 'templates/directives/mediaPreview.html'
      };
    }]
);
