var app = angular.module('instanews.file', ['ionic', 'ngResource']);

var urlBase = "http://192.168.100.10:3000/api";

app.directive('fileItem', function ($compile) {

   var getSrc = function (subarticle) {
      return '"' + urlBase + '/storages/' + subarticle.parentId + '/download/' + subarticle._file.name + '"';
   }

   var getTemplate = function (subarticle) {
      var template = '';

      switch(subarticle._file.type) {
         case 'image':
            template = '<div class="item-image"><img src='+ getSrc(subarticle) + '></div>';
            break;
         case 'video':
            template = '<div class="file-video"><video src='+ getSrc(subarticle) +
                        ' controls="controls"></video></div>';
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
