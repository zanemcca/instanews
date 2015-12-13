'use strict';
var app = angular.module('instanews.directive.sidemenu', []);

app.directive('sidemenu', function() {
  var linkFunction = function(scope, element, attributes) {
    element[0].className = element[0].className + ' ' + attributes.sidemenu;

    if(attributes.sidemenu === 'sidemenu-glass-avatar'){
      //get the url of the profile pic
      var img = element.find('img');
      img.bind('load', function () {
        console.log(img[0].src);
        var cssToAppend = '.sidemenu-glass-avatar::before {background: url(\'' + img[0].src + '\');}';
        //var x = '<style>' + cssToAppend + '</style>';
        var htmlDiv = document.createElement('div');
        htmlDiv.innerHTML = '<style>' + cssToAppend + '</style>';
        document.getElementsByTagName('head')[0].appendChild(htmlDiv);
      });
    }
  };
  return {
    restrict: 'AC',
    link: linkFunction
  };
});

app.directive('profile', function() {
  var linkFunction = function(scope, element, attributes) {
    element[0].className = element[0].className + ' ' + attributes.profile;
    var img;

    if(attributes.profile === 'profile-small-glass'){
      //get the url of the profile pic
      img = element.find('img');
      img.bind('load', function () {
        console.log(img[0].src);
        var cssToAppend = '.profile-small-glass::before {background: url(\'' + img[0].src + '\');}';
        //var x = '<style>' + cssToAppend + '</style>';
        var htmlDiv = document.createElement('div');
        htmlDiv.innerHTML = '<style>' + cssToAppend + '</style>';
        document.getElementsByTagName('head')[0].appendChild(htmlDiv);
      });
    }
   if(attributes.profile === 'profile-large-glass'){
      //get the url of the profile pic
      img = element.find('img');
      img.bind('load', function () {
        console.log(img[0].src);
        var cssToAppend = '.profile-large-glass::before {background: url(\'' + img[0].src + '\');}';
        //var x = '<style>' + cssToAppend + '</style>';
        var htmlDiv = document.createElement('div');
        htmlDiv.innerHTML = '<style>' + cssToAppend + '</style>';
        document.getElementsByTagName('head')[0].appendChild(htmlDiv);
      });
    }
  };

  return {
    restrict: 'AC',
    link: linkFunction
  };
});
