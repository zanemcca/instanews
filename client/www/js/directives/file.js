var app = angular.module('instanews.file', ['ionic', 'ngResource']);

var urlBase = 'http://192.168.100.10:3000/api';

app.directive('fileItem', function ($compile) {

   var id;


   var getSrc = function (subarticle) {
      if (subarticle._file.name.indexOf('file:///') > -1) {
         return subarticle._file.name;
      }
      else {
         return '"' + urlBase + '/storages/' +
            subarticle.parentId + '/download/' +
            subarticle._file.name + '"';
      }
   };

   var getWidth = function (file) {

   };

   var getTemplate = function (subarticle) {
      var template = '';

      var type = subarticle._file.type;
      if(type.indexOf('image') > -1) {
         template = '<div class="item no-padding item-image">' +
            '<img height="auto" width="auto" src='+
            getSrc(subarticle) + '></div>';
      }
      else if (type.indexOf('video') > -1) {
         id = 'video_' + subarticle.myId;

         template = '<div id="video-container">' +
         '<video poster="' + subarticle._file.poster +
         '" controls width="100%" id="'+ id + '"';

         if (ionic.Platform.isIOS()) {
            console.log('isIOS');
            template += '>'
         }
         else {
            console.log('is not IOS');
            template += ' class="video-js vjs-default-skin' +
            ' vjs-big-play-centered vjs-paused vjs-controls-enabled' +
            ' vjs-user-active" data-setup={}>';
         }

         template += '<source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">'+
         '<source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm">'+
         '</video></div>';
      }
      else {
         console.log('Bad file type... ', subarticle._file.type);
      }

      template += '<div class="item" style="padding-bottom:0px">' +
         '<p class="no-margin">' +
         subarticle._file.caption +
         '</p>' +
      '</div>';

      return template;
   };

   var disableTap = function(disable) {
      container = document.getElementById('video-container');
      if (disable && !ionic.platform.isIOS()) {
         angular.element(container).attr('data-tap-disabled','true');
      }
      else {
         angular.element(container).removeAttr('data-tap-disabled')
      }
   };

   var linker = function (scope, element, attrs) {
      if (scope.subarticle && scope.subarticle._file) {
         element.html(getTemplate(scope.subarticle));

         if (scope.subarticle._file.type.indexOf('video') > -1) {

            console.log('Created ' + id);

            if ( !ionic.Platform.isIOS()) {
               videojs(id).ready( function() {

                  var player = this;
                  scope.$on('$destroy', function () {
                     player.dispose();
                     console.log('Destroyed ', id);
                  });

                  player.on('play', function(err) {
                     disableTap(true);
                     console.log('Playing!!');
                  });

                  player.on('pause', function(err) {
                     disableTap(false);
                     console.log('PAUSED!!');
                  });

                  player.on('ended', function(err) {
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
         subarticle: '='
      },
      link: linker
   };
});
