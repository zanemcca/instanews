
'use strict';
var app = angular.module('instanews.service.navigate', ['ionic', 'ngResource','ngCordova']);

app.service('Navigate', [
  '$ionicNavBarDelegate',
  '$ionicSideMenuDelegate',
  '$ionicScrollDelegate',
  '$ionicHistory',
  '$state',
  '$timeout',
  '$window',
  'User',
  function(
    $ionicNavBarDelegate,
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $ionicHistory,
    $state,
    $timeout,
    $window,
    User
  ){

    var animate = true;

    var userRequiredStates = [
      'app.articlePost',
      'app.subarticlePost'
    ];

    var redirect = {
      prev: null,
      next: null
    };

    var go =  function(state, params) {
      if(redirect.next && !state) {
        $state.go(redirect.next, redirect.nextParams);
      } else if(userRequiredStates.indexOf(state) > -1) {
        var user = User.get();
        if(!user) {
          redirect.next = state;
          redirect.nextParams = params;
          var current = $ionicHistory.currentView();
          redirect.prev = current.stateId; 
          $ionicNavBarDelegate.showBackButton(true);
          $state.go('app.login');
        } else {
          $state.go(state, params);
        }
      } else {
        $state.go(state, params);
      }
    };

    var goBack = function () {
      var viewCount = 1;
      if(redirect.prev) {
        var history = $ionicHistory.viewHistory();
        console.log(history);
        if(redirect.prev !== history.backView.stateId) {
          var histId = $ionicHistory.currentHistoryId();
          var hist = history.histories[histId];
          for(;viewCount < hist.stack.length; viewCount++) {
            var curr = hist.stack[hist.stack.length - 1 - viewCount];
            if(curr.stateId === redirect.prev) {
              console.log(curr);
              break;
            }
          }
        }
        redirect = {};
      }
      console.log('Going back ' + viewCount + ' views');
      $ionicHistory.goBack(0 - viewCount);
    };

    var toggleMenu = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

    var disableNextBack = function() {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
    };

    var focus = function (id) {
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element) {
          element.focus();
        }
      });
    };

    var scroll = function(spec) {
      spec = spec || {};
      if(!spec.scrollHandle) { 
        console.log('Warning: Spec.scrollHandle is needed to avoid controlling all scrolls');
      }
      if(!spec.$location) {
        console.log('Info: Since Spec.$location is not set it is up to the user to call $location.hash' +
                    'on the anchors before calling Navigate.anchorScroll(anchor)');
      }

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

      return {
        scrollTop: scrollTop,
        resize: resize,
        anchorScroll: anchorScroll,
        toggleAnchorScroll: toggleAnchorScroll,
        //   onScroll: onScroll,
      };
    };

    return {
      scroll: scroll,
      toggleMenu: toggleMenu,
      focus: focus,
      go: go,
      goBack: goBack,
      disableNextBack: disableNextBack
    };
  }]);
