
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

      $scope.Platform = Platform;

      $scope.sources = [];
      for(var i in $scope.media.sources) {
        var src = $scope.media.sources[i];
        if(src.indexOf('.m3u8') > -1) {
          if(Platform.isIOS()) {
            $scope.sources.unshift({
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
    '$element',
    'ENV',
    'Platform',
    function (
      $scope,
      $element,
      ENV,
      Platform
    ) {

      var urlBase = ENV.photoEndpoint;
      var getUrl = function(container, fileName) {
        var url = fileName;
        if(fileName.indexOf('file://') !== 0) {
          url = urlBase + '/' + url;
        }
        return url;
      };

      var isVideo = false;
      $scope.isVideo = function () {
        return isVideo;
      };

      $scope.img = {
        height: 0,
        width: 0
      };

      var rendered = {
        height: 0,
        width: 0
      };

      var getPrefix = function(sources) {
        //TODO Come up with a more clear solution for 
        //the quality mapping
        var prefixs = ['XS', 'S', 'M', 'L'];
        var done = false;
        var max = -1;
        for(var j in prefixs) {
          var idx = prefixs.length - 1 - j;
          var p = prefixs[idx];
          for(var i in sources) {
            var source = sources[i];
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

        return Platform.getSizeClassPrefix(max);
      }; 

      var findSource = function () {
        var prefix = getPrefix($scope.media.sources);
        var src = prefix + '-' + $scope.media.name;

        for(var i in $scope.media.sources) {
          if($scope.media.sources[i].prefix === prefix) {
            $scope.img.height = $scope.media.sources[i].height;
            $scope.img.width = $scope.media.sources[i].width;
            break;
          }
        }

        isVideo = false;
        urlBase = ENV.photoEndpoint;
        // If this is a video then it will
        // have a poster which should be used
        // instead of other sources
        if($scope.media.poster) {
          urlBase = ENV.videoEndpoint;
          src = $scope.media.poster;
          isVideo = true;
        } else if($scope.media.source) {
          // Local source
          src = $scope.media.source;
        }

        // istanbul ignore else 
        if(src) {
          $scope.source = getUrl($scope.container, src);
          if($scope.img.height && $scope.img.width) {
            var height = $scope.img.height;
            var width = $scope.img.width;
            if($scope.degrees % 180) {
              height = $scope.img.width;
              width = $scope.img.height;
            }

            var elem = $element[0];
            while(elem.tagName !== 'ION-CONTENT') {
              if(elem.parentElement) {
                elem = elem.parentElement;
              } else {
                elem = null;
                break;
              }
            }

            rendered = Platform.getMaxImageDimensions(elem);


            if(rendered.width > width) {
              if(rendered.height > height) {
                rendered.width = width;
                rendered.height = height;
              } else {
                rendered.width = Math.round(rendered.height/height*width);
              }
            } else {
              var maxH = Math.round(rendered.width/width*height);
              if(rendered.height > maxH) {
                rendered.height = maxH;
              } else {
                rendered.width = Math.round(rendered.height/height*width);
              }
            }

            $scope.rotate = $scope.degrees;
          }
        } else {
          //TODO Create some kind of image that lets users know the photo is broken
          console.error('There is no valid photo source given!');
          console.log($scope.media);
        }
      };

      findSource();

      $scope.imgStyle = function () {
        if(rendered.height && rendered.width) {
          return {
            'height': '100%',
            'width': '100%'
          };
        } else {
          return {
            'height': 'auto',
            'width': 'auto'
           };
        }
      };

      $scope.containerStyle = function () {
        if(rendered.height && rendered.width) {
          return {
            'margin': 'auto',
            'background-color': '#EFEFFF',
            'height': rendered.height + 'px',
            'width': rendered.width + 'px',
            'max-width': rendered.width + 'px',
            'max-height': rendered.height + 'px'
          };
        }
      };

      $scope.subContainerStyle = function() {
        if(rendered.height && rendered.width) {
          var res = {
            'height': rendered.height + 'px',
            'width': rendered.width + 'px'
          };
          if($scope.degrees % 180) {
            res.height = rendered.width + 'px';
            res.width = rendered.height + 'px';
            res.maxWidth = res.width;
            res.maxHeight = res.height;
            res.position = 'relative';
            res.top = (Math.abs(rendered.height - rendered.width)/2) + 'px';
            if($scope.img.height > $scope.img.width) {
              res.top = '-' + res.top;
            } else {
              res.left = '-' + res.top;
            }
          }

          return res;
        }
      };

      $scope.$watch('media', function(oldMedia, newMedia) {
        if(oldMedia.name !== newMedia.name) {
          findSource();
        }
      });

      $scope.$watch('degrees', function(oldDegrees, degrees) {
        if(oldDegrees % 180 !== degrees % 180) {
          findSource();
        }
      });
    }]
);

app.directive(
  'inimage', [
    function(
    ) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var img, url, degrees = 0;

          var resetImage = function() {
            if(img) {
              img.remove();
            }

            var style = {};

            if(scope.img.height && scope.img.width) {
              style.height = '100%';
              style.width= '100%';
            } else {
              style.height = 'auto';
              style.width= 'auto';
            }

            var image = new Image();
            image.onload = function() {
              scope.$apply(function() {
                scope.img.height = image.naturalHeight;
                scope.img.width = image.naturalWidth;
              });
            };

            image.src = url;

            img = angular.element(image);
            img.css(style);
            element.append(img);
          };

          scope.$watch(attrs.url, function(URL) {
            if(typeof(URL) === 'string') {
              url = URL;
              resetImage();
            }
          }); 

          scope.$watch(attrs.degrees, function(degs) {
            if(typeof(degs) === 'number') {
              degrees = degs;
              resetImage();
            }
          });
        }
      };
    }
  ]
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
          enableFocus: '=',
          editCaption: '=',
          degrees: '=',
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

app.directive(
  'rotate',
  function() {
    return {
      link: function(scope, element, attrs) {
          scope.$watch(attrs.rotate, function(degrees) {
            if(typeof(degrees) === 'number') {
              degrees %= 360;
              element.css({
                  '-webkit-transform': 'rotate(' + degrees + 'deg)',
                  '-ms-transform': 'rotate(' + degrees + 'deg)',
                  '-moz-transform': 'rotate(' + degrees + 'deg)',
                  '-o-transform': 'rotate(' + degrees + 'deg)',
                  'transform': 'rotate(' + degrees + 'deg)'
              });
            }
          });
      }
    };
});
