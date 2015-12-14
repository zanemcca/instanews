
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
app.controller(
  'videoCtrl', [
    '$scope',
    '$sce',
    'ENV',
    'Platform',
    function ($scope, $sce, ENV, Platform) {

      var getUrl = function(container, fileName) {
        var url = '';
        if(fileName.indexOf('file://') === 0) {
          url = fileName;
        } else {
          url = ENV.videoEndpoint;
          url += '/' + fileName;
        }
        return url;
      };

      $scope.sources = [];
      for(var i in $scope.media.sources) {
        var src = $scope.media.sources[i];
        if(src.indexOf('.m3u8') > -1) {
          if(Platform.isIOS()) {
            $scope.sources.push({
              src: $sce.trustAsResourceUrl(getUrl($scope.media.container, src)),
              type: 'application/vnd.apple.mpegURL'
            });
          }
        } else {
          $scope.sources.push({
            src: $sce.trustAsResourceUrl(getUrl($scope.media.container, src)),
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
    'Platform',
    function (
      $scope,
      ENV,
      Platform
    ) {

      //TODO Come up with a more clear solution for 
      //the quality mapping
      var prefixs = ['XS', 'S', 'M', 'L'];
      var done = false;
      var max = -1;
      for(var j in prefixs) {
        var idx = prefixs.length - 1 - j;
        var p = prefixs[idx];
        for(var i in $scope.media.sources) {
          var source = $scope.media.sources[i];
          if(source.prefix === p) {
            max = idx;
            done = true;
            break;
          }
        }
        if(done) {
          break;
        }
      }

      var prefix = Platform.getSizeClassPrefix(max);

      var urlBase = ENV.photoEndpoint;

      var getUrl = function(container, fileName) {
        var url = fileName;
        if(fileName.indexOf('file://') !== 0) {
          url = urlBase + '/' + url;
        }
        return url;
      };

      var src = prefix + '-' + $scope.media.name;

      // If this is a video then it will
      // have a poster which should be used
      // instead of other sources
      if($scope.media.poster) {
        urlBase = ENV.videoEndpoint;
        src = $scope.media.poster;
      } else if($scope.media.source) {
        // Local source
        src = $scope.media.source;
      }

      // istanbul ignore else 
      if(src) {
        $scope.source = getUrl($scope.container, src);
      } else {
        //TODO Create some kind of image that lets users know the photo is broken
        console.error('There is no valid photo source given!');
        console.log($scope.media);
      }
    }]
);


//This directive will display subarticle media in a consumable format
// istanbul ignore next
app.directive(
  'inmedia', [
    function () {

      return {
        restrict: 'E',
        scope: {
          isMine: '=',
          editCaption: '=',
          media: '='
        },
        templateUrl: 'templates/directives/media.html'
      };
    }]
);

//This directive will display media in a preview format
// istanbul ignore next
app.directive(
  'inmediapreview', [
    function (
    ) {

      return {
        restrict: 'E',
        scope: {
          media: '='
        },
        controller: function(
        ) {
        },
        templateUrl: 'templates/directives/mediaPreview.html'
      };
    }]
);
