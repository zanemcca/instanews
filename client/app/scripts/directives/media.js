
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

function getUrl(urlBase, container, fileName) {
  var url = '';
  if(fileName.indexOf('file://') === 0) {
    url = fileName;
  } else {
    url = urlBase;
    url += '/' + fileName;
  }
  return url;
}

function getRenderSizeAndSetRotation(scope, $element, Platform) { 
  if(scope.naturalSize.height && scope.naturalSize.width) {
    var height = scope.naturalSize.height;
    var width = scope.naturalSize.width;
    if(scope.degrees % 180) {
      height = scope.naturalSize.width;
      width = scope.naturalSize.height;
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

    var rendered = Platform.getMaxImageDimensions(elem);

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

    scope.rotate = scope.degrees;
    return rendered;
  }
}

function containerStyle(rendered) {
  if(rendered.height && rendered.width) {
    return {
      'margin': 'auto',
      'background-color': '#EFEFFF',
      'height': rendered.height + 'px',
      'width': rendered.width + 'px',
      'max-width': rendered.width + 'px',
      'max-height': rendered.height + 'px'
    };
  } else {
    console.log('No Rendered height!');
  }
}

function subContainerStyle(scope, rendered) {
  if(rendered.height && rendered.width) {
    var res = {
      'height': rendered.height + 'px',
      'width': rendered.width + 'px'
    };
    if(scope.degrees % 180) {
      res.height = rendered.width + 'px';
      res.width = rendered.height + 'px';
      res.maxWidth = res.width;
      res.maxHeight = res.height;
      res.position = 'relative';
      res.top = (Math.abs(rendered.height - rendered.width)/2) + 'px';
      if(scope.naturalSize.height > scope.naturalSize.width) {
        res.top = '-' + res.top;
      } else {
        res.left = '-' + res.top;
      }
    }

    return res;
  }
}

function videoSetup(scope, attrs, $element, $sce, ENV, Platform) {
  var rendered = {
    width: 0,
    height: 0
  };

  scope.Platform = Platform;
  scope.naturalSize = {
    height: 0,
    width: 0
  };

  scope.config = {
    preload: 'none',
    plugins: {
      controls: {
        autoHide: true,
        autoHideTime: 3000
      }
    }
  };

  if(Platform.isIOS()) {
    scope.config.nativeControls = true;
  }

  var findSources = function() {
    scope.config.sources = [];
    var addSrc = function(src) {
      if(src.indexOf('.m3u8') > -1) {
        if(Platform.isIOS()) {
          scope.config.sources.unshift({
            src: $sce.trustAsResourceUrl(getUrl(ENV.videoEndpoint, scope.media.container, src)),
            type: 'application/vnd.apple.mpegURL'
          });
        }
      } else {
        scope.config.sources.push({
          src: $sce.trustAsResourceUrl(getUrl(ENV.videoEndpoint, scope.media.container, src)),
          type: 'video/mp4'
        });
      }
    };

    if(scope.media.sourceMetadata) {
      for(var i in scope.media.sourceMetadata) {
        var meta = scope.media.sourceMetadata[i];
        if(meta.name.indexOf('.m3u8') > -1 && Platform.isIOS()) {
          scope.naturalSize.height = meta.height;
          scope.naturalSize.width = meta.width;
        } else if(!Platform.isIOS()){
          scope.naturalSize.height = meta.height;
          scope.naturalSize.width = meta.width;
        }

        addSrc(meta.name);
      }
    } else {
      for(var j in scope.media.sources) {
        addSrc(scope.media.sources[j]);
      }
    }

    rendered = getRenderSizeAndSetRotation(scope, $element, Platform) || rendered;

    if(scope.media.poster) {
      scope.config.poster = getUrl(ENV.videoEndpoint, scope.media.container, scope.media.poster);
    }
  };

  findSources();

  scope.containerStyle = function () {
    return containerStyle(rendered);
  };

  scope.$watch(attrs.media, function(oldMedia, newMedia) {
    if(newMedia && (!oldMedia || oldMedia.name !== newMedia.name)) {
      findSources();
    }
  });
}

function imageSetup(scope, attrs,  $element, ENV, Platform) {
  var urlBase = ENV.photoEndpoint;
  var isVideo = false;
  var rendered = {
    height: 0,
    width: 0
  };

  scope.isVideo = function () {
    return isVideo;
  };

  scope.naturalSize = {
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
    var prefix = getPrefix(scope.media.sources);
    var src = prefix + '-' + scope.media.name;

    for(var i in scope.media.sources) {
      if(scope.media.sources[i].prefix === prefix) {
        scope.naturalSize.height = scope.media.sources[i].height;
        scope.naturalSize.width = scope.media.sources[i].width;
        break;
      }
    }

    isVideo = false;
    urlBase = ENV.photoEndpoint;
    // If this is a video then it will
    // have a poster which should be used
    // instead of other sources
    if(scope.media.poster) {
      urlBase = ENV.videoEndpoint;
      src = scope.media.poster;
      isVideo = true;

      for(var j in scope.media.sourceMetadata) {
        var meta = scope.media.sourceMetadata[j];
        if(meta.name.indexOf('SD.mp4') > -1) {
          scope.naturalSize.height = meta.height;
          scope.naturalSize.width = meta.width;
          break;
        }
      }
    } else if(scope.media.source) {
      // Local source
      src = scope.media.source;
    }

    // istanbul ignore else 
    if(src) {
      scope.source = getUrl(urlBase, scope.container, src);
      rendered = getRenderSizeAndSetRotation(scope, $element, Platform) || rendered; 
    } else {
      //TODO Create some kind of image that lets users know the photo is broken
      console.error('There is no valid photo source given!');
      console.log(scope.media);
    }
  };

  findSource();

  scope.containerStyle = function () {
    return containerStyle(rendered);
  };

  scope.subContainerStyle = function() {
    return subContainerStyle(scope, rendered);
  };

  scope.$watch(attrs.media, function(oldMedia, newMedia) {
    if(newMedia && (!oldMedia || oldMedia.name !== newMedia.name)) {
      findSource();
    }
  });

  scope.$watch(attrs.degrees, function(oldDegrees, degrees) {
    if(oldDegrees % 180 !== degrees % 180) {
      findSource();
    }
  });
}

app.directive('inimage', [
  function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var img, url, degrees = 0;

        var resetImage = function() {
          if(img) {
            img.remove();
          }

          var style = {};

          if(scope.naturalSize.height && scope.naturalSize.width) {
            style.height = '100%';
            style.width= '100%';
          } else {
            style.height = 'auto';
            style.width= 'auto';
          }

          var image = new Image();
          image.onload = function() {
            scope.$apply(function() {
              scope.naturalSize.height = image.naturalHeight;
              scope.naturalSize.width = image.naturalWidth;
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
]);

//This directive will display subarticle media in a consumable format
// istanbul ignore next
app.directive('inmedia', [
  '$sce',
  'ENV',
  'Platform',
  function (
    $sce,
    ENV,
    Platform
  ) {
    return {
      restrict: 'E',
      scope: {
        isMine: '=',
        enableFocus: '=',
        editCaption: '=',
        degrees: '=',
        media: '='
      },
      link: {
        pre: function(scope, attrs, element) {
          if(scope.media.type.indexOf('video') === 0) {
            videoSetup(scope, attrs, element.$$element, $sce, ENV, Platform);
          } else if(scope.media.type.indexOf('image') === 0) {
            imageSetup(scope, attrs, element.$$element, ENV, Platform);
          }
        }
      },
      templateUrl: 'templates/directives/media.html'
    };
  }
]);

//This directive will display media in a preview format
// istanbul ignore next
app.directive('inmediapreview', [
  '$sce',
  'ENV',
  'Platform',
  function (
    $sce,
    ENV,
    Platform
  ) {
    return {
      restrict: 'E',
      scope: {
        media: '='
      },
      link: {
        pre: function(scope, attrs, element) {
          imageSetup(scope, attrs, element.$$element, ENV, Platform);
        }
      },
      templateUrl: 'templates/directives/mediaPreview.html'
    };
  }
]);

app.directive('rotate', function() {
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
