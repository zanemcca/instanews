
'use strict';
var app = angular.module('instanews.service.navigate', ['ionic', 'ngResource','ngCordova']);

app.service('Navigate', [
  '$ionicSideMenuDelegate',
  '$ionicScrollDelegate',
  '$ionicHistory',
  '$timeout',
  '$window',
  function(
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $ionicHistory,
    $timeout,
    $window
  ){
      var navigate = function(spec) {
        spec = spec || {};
        if(!spec.scrollHandle) { 
          console.log('Warning: Spec.scrollHandle is needed to avoid controlling all scrolls');
        }
        if(!spec.$location) {
          console.log('Info: Since Spec.$location is not set it is up to the user to call $location.hash' +
                      'on the anchors before calling Navigate.anchorScroll(anchor)');
        }

        var toggleMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
        };

        var disableNextBack = function() {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
        };

        var scrollTop = function() {
          var delegate = $ionicScrollDelegate;
          if(spec.scrollHandle) {
            delegate = delegate.$getByHandle(spec.scrollHandle);
          }
          delegate.scrollTop(true);
        };

        var resize = function () {
          var delegate = $ionicScrollDelegate;
          if(spec.scrollHandle) {
            delegate = delegate.$getByHandle(spec.scrollHandle);
          }
          delegate.resize();
        };

        var getScrollDelegate = function () {
          var delegate = $ionicScrollDelegate;
          if(spec.scrollHandle) {
            delegate = delegate.$getByHandle(spec.scrollHandle);
          }
          return delegate;
        };

        var animate = true;

        var anchorScroll = function (anchor) {
          document.getElementById(anchor).scrollIntoView();
          /*
           * TODO Find source of scrolling from top bug
           * then use animated ionic scrolling
          if(spec.$location) {
            spec.$location.hash(anchor);
          }

          getScrollDelegate().anchorScroll(animate);
         */
        };

        var scroll = {};
        var toggleAnchorScroll = function (anchor) {
          if(scroll.oldPosition) {
            // The toggle should only move back to the original location if the user has not scrolled much
            // or if they clicked the toggle back very rapidly 
            var curr = getScrollDelegate().getScrollPosition();
            if(!scroll.currentPosition || Math.abs(scroll.currentPosition.top - curr.top) <= 30) {
              getScrollDelegate().scrollTo(0, scroll.oldPosition.top, animate);
            }
            scroll.oldPosition = null;
          } else {
            scroll.oldPosition = getScrollDelegate().getScrollPosition();
            anchorScroll(anchor);
            scroll.currentPosition = null;
            setTimeout(function () {
              scroll.currentPosition = getScrollDelegate().getScrollPosition();
            }, 1000);
          }
        };

        /*
           var onScroll = function() {
           if($ionicScrollDelegate.getScrollPosition().top > 0) {
           return true;
           }
           else {
           return false;
           }
           };

        //TODO Rewrite this use ionic on-swipe-down gesture
        $scope.scroll = {
buttonOn: false
};

//TODO get the scroll to top button disabling appropriately
$scope.onScroll = function() {
$scope.scroll.buttonOn = Navigate.onScroll();
console.log('Scroll top on ? ' + $scope.scroll.buttonOn);
};
*/

        var focus = function (id) {
          $timeout(function() {
            var element = $window.document.getElementById(id);
            if(element) {
              element.focus();
            }
          });
        };

        return {
          toggleMenu: toggleMenu,
          focus: focus,
          scrollTop: scrollTop,
          resize: resize,
          anchorScroll: anchorScroll,
          toggleAnchorScroll: toggleAnchorScroll,
          //   onScroll: onScroll,
          disableNextBack: disableNextBack
        };
      };

      return navigate;
    }]);
