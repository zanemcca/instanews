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

      switch(subarticle._file.type) {
         case 'image':
            template = '<div class="item no-padding item-image">' +
               '<img height="auto" width="auto" src='+
               getSrc(subarticle) + '></div>';
            break;
         case 'video':
            id = 'video_' + subarticle.myId;

            template = '<div id="video-container">' +
         '<video id="'+ id +
            '" width="100%" class="video-js vjs-default-skin' +
            ' vjs-big-play-centered vjs-paused vjs-controls-enabled' +
            ' vjs-user-active" controls data-setup={}>' +
         '<source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">'+
         '<source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm">'+
         '</video></div>';
            break;
      }
      return template;
   };

   var disableTap = function(disable) {
      container = document.getElementById('video-container');
      if (disable) {
         angular.element(container).attr('data-tap-disabled','true');
      }
      else {
         angular.element(container).removeAttr('data-tap-disabled')
      }
   };

   var linker = function (scope, element, attrs) {
      element.html(getTemplate(scope.subarticle));

      if (scope.subarticle._file.type === 'video') {

         console.log('Created ' + id);

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
      $compile(element.contents())(scope);

   };

   return {
      restrict: 'E',
      link: linker
   };
});
