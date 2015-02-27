var app = angular.module('instanews.file', ['ionic', 'ngResource']);

var urlBase = "http://192.168.100.10:3000/api";

app.directive('fileItem', function ($compile) {

   var getSrc = function (subarticle) {
      return '"' + urlBase + '/storages/' + subarticle.parentId + '/download/' + subarticle._file.name + '"';
   }

   var getWidth = function (file) {

   }

   var getTemplate = function (subarticle) {
      var template = '';

      switch(subarticle._file.type) {
         case 'image':
            template = '<div class="item no-padding item-image"><img height="480px"  src='+ getSrc(subarticle) + '></div>';
            break;
         case 'video':
            /*
            template = '<div><video height="360px" controls preload="metadata" src='
                        + getSrc(subarticle) +'></video></div>';
                        */
            template = '<div class="video-container" data-tap-disabled="true">'
                        + '<video id="video_' + subarticle.subarticleId + '" class="video-js vjs-default-skin vjs-big-play-centered" controls width="auto" height="auto" data-setup=\'{}\'>'
                           + '<source src='+ getSrc(subarticle) +' type=\'video/mp4\'>'
                        + '</video></div>';
            break;
      }
      return template;
   }

   var linker = function (scope, element, attrs) {
      element.html(getTemplate(scope.subarticle));
      $compile(element.contents())(scope);
   }

   return {
      restrict: "E",
      link: linker
   };
});
