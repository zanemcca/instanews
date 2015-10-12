
'use strict';
var app = angular.module('instanews.directive.data', ['ionic', 'ngResource']);

//This directive will display data in a preview format
app.directive('indatapreview', [
      function () {

   return {
      restrict: 'E',
      scope: {
         article: '='
      },
      controller: function() {
      },
      templateUrl: 'templates/directives/dataPreview.html'
   };
}]);

//This directive will display subarticle data in a consumable format
app.directive('indata',[
      '$compile',
      'ENV',
      'Platform',
      function (
        $compile,
        ENV,
        Platform
      ) {

    var urlBase = ENV.apiEndpoint;

        //TODO Use the storage api
   var getSrc = function (data) {
      var name;
      if (data.name) {
         name = data.name;
      }
      else if(data.fullPath) {
         name = data.fullPath;
      }
      else if(data.imageURI) {
         name = data.URI;
      }

      if (name.indexOf('file:///') > -1) {
         return name;
      }
      else {
        console.log('Data:');
        console.dir(data);

        var src = '"' + urlBase + '/storages/' + data.container;

        src += '/download/' + data.sources[0] + '"';

        return src;
      }
   };

   //TODO move this into an HTML file instead of writing on the fly
   var videoId;
   var getTemplate = function (id, data) {
      var template = '';

      var type = data.type;
      if(type.indexOf('image') > -1) {
         template = '<div class="item no-padding item-image">' +
            '<img height="auto" width="auto" src='+
            getSrc(data) + '></div>';
      }
      else if (type.indexOf('video') > -1) {
         videoId = 'video_' + id;

         template = '<div id="video-container">' +
         '<video poster="' + urlBase + '/storages/' + data.container + '/download/' + data.poster +
         '" controls width="100%" id="'+ videoId + '"';

         if (Platform.isIOS()) {
            template += '>';
         }
         else {
            template += ' class="video-js vjs-default-skin' +
            ' vjs-big-play-centered vjs-paused vjs-controls-enabled' +
            ' vjs-user-active" data-setup={}>';
         }

         //TODO Redo the sourcing
         var src = getSrc(data);

         template += '<source src=' + src + ' type="'+ type +'">'+
         '</video></div>';
         /*
         template += '<source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">'+
         '<source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm">'+
         '</video></div>';
         */
      }
      else {
         console.log('Bad file type... ', data.type);
      }

      template += '<div class="item" style="padding-bottom:0px">' +
         '<p class="no-margin">' +
         data.caption +
         '</p>' +
      '</div>';

      return template;
   };

   var disableTap = function(disable) {
      var container = document.getElementById('video-container');
      if (disable && !Platform.isIOS()) {
         angular.element(container).attr('data-tap-disabled','true');
      }
      else {
         angular.element(container).removeAttr('data-tap-disabled');
      }
   };

   var linker = function (scope, element, attrs) {
      console.log('Attributes: ' + attrs);
      if (scope.data) {
         element.html(getTemplate(scope.id, scope.data));

         if (scope.data.type.indexOf('video') > -1) {

            if ( !Platform.isIOS()) {
               videojs(videoId).ready( function() {

                  var player = this;
                  scope.$on('$destroy', function () {
                     player.dispose();
                  });

                  player.on('play', function(err) {
                     if(err) {
                        console.log(err);
                     }
                     disableTap(true);
                     console.log('Playing!!');
                  });

                  player.on('pause', function(err) {
                     if(err) {
                        console.log(err);
                     }
                     disableTap(false);
                     console.log('PAUSED!!');
                  });

                  player.on('ended', function(err) {
                     if(err) {
                        console.log(err);
                     }
                     disableTap();
                     console.log('ENDED!!');
                  });
               });
            }
         }
         $compile(element.contents())(scope);
      }
      else {
         console.log('Bad subarticle');
      }
   };

   return {
      restrict: 'E',
      scope: {
         data: '=',
         id: '='
      },
      link: linker
   };
}]);
