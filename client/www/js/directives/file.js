var app = angular.module('instanews.file', ['ionic', 'ngResource']);

var urlBase = "http://192.168.100.10:3000/api";

app.directive('fileItem', function ($compile) {

   var getSrc = function (subarticle) {
      if (subarticle._file.name.indexOf('file:///') > -1) {
         return subarticle._file.name;
      }
      else {
         return '"' + urlBase + '/storages/' + subarticle.parentId + '/download/' + subarticle._file.name + '"';
      }
   }

   var getWidth = function (file) {

   }

   var getTemplate = function (subarticle) {
      var template = '';

      switch(subarticle._file.type) {
         case 'image':
            template = '<div class="item no-padding item-image"><img height="auto" width="auto" src='+ getSrc(subarticle) + '></div>';
            break;
         case 'video':
            /*
            template = '<div><video height="360px" controls preload="metadata" src='
                        + getSrc(subarticle) +'></video></div>';
                        */
            /*
            template = '<div class="video-container" data-tap-disabled="true">'
                        + '<video id="video_' + subarticle.subarticleId + '" class="video-js vjs-default-skin vjs-big-play-centered" controls width="auto" height="auto" data-setup=\'{}\'>'
                           + '<source src='+ getSrc(subarticle) +' type=\'video/mp4\'>'
                        + '</video></div>';
*/
            template = '<div data-tap-disabled="true">'
               +'<video id="video_test" width="100%" class="video-js vjs-default-skin vjs-big-play-centered vjs-paused vjs-controls-enabled vjs-user-active" controls data-setup={}>'
                  +'<source src="http://video.ch9.ms/ch9/7066/1fbfb520-2165-4a16-9d54-84583b377066/WindowsAzureMediaServicesNETSDK_mid.mp4" type="video/mp4" onerror="ch9.functions.html5Presenter.fallback(this);">'
                  +'<source src="http://d1s3yn3kxq96sy.cloudfront.net/bigbuckbunny/index.m3u8">'
                  +'<source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">'
                  +'<source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm">'
               +'</video></div>'
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
