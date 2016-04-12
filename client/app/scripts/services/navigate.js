
'use strict';
var app = angular.module('instanews.service.navigate', ['ionic', 'ngResource','ngCordova']);

app.service('Navigate', [
  '$ionicNavBarDelegate',
  '$ionicSideMenuDelegate',
  '$ionicScrollDelegate',
  '$ionicHistory',
  '$ionicPlatform',
  '$state',
  '$timeout',
  '$window',
  'Platform',
  'Terms',
  'User',
  function(
    $ionicNavBarDelegate,
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $ionicHistory,
    $ionicPlatform,
    $state,
    $timeout,
    $window,
    Platform,
    Terms,
    User
  ){

    var animate = true;

    var userRequiredStates = [
      'app.articlePost',
      'app.subarticlePost'
    ];

    var loginSuccess;
    var redirect = {
      prev: null,
      next: null
    };

    // If the previous view and the next view are the same then goBack instead of forward
    var goOrGoBack = function(state) {
      if(!state) {
        state = redirect.next;
      }
      var prev = $ionicHistory.backView();
      if(!state || state === prev.stateId) {
        goBack();
      } else {
        go(state);
      }
      satisfyLoginSuccessCallback();
    };

    // Checks if the login view is going back and if
    // it succeeded, then it wil call the success callback.
    // If not then it will just clear the callback
    var satisfyLoginSuccessCallback = function () {
      if(loginSuccess) {
        var curr = $ionicHistory.currentView();
        if(curr.stateId === 'app.login') {
          var user = User.get();
          if(user) {
            // Wait a frame
            $timeout(loginSuccess, 16);
          }
          loginSuccess = null;
        }
      }
    };

    var go =  function(state, params) {
      var current = $ionicHistory.currentView();

      if(redirect.next && !state) {
        $state.go(redirect.next, redirect.nextParams);
      } else if(userRequiredStates.indexOf(state) > -1) {
        var user = User.get();
        if(!user) {
          redirect.next = state;
          redirect.nextParams = params;
          redirect.prev = current.stateId; 
          $state.go('app.login');
        } else {
          Terms.ensure(function() {
            $state.go(state, params);
          },function() {
            console.log('Navigation is invalid because terms were not agreed to!');
            Platform.loading.hide();
          });
        }
      } else if(current.stateName === state && (!params.id || params.id === current.stateParams.id)) {
        console.log('Not navigating to the same state!');
        Platform.loading.hide();
      } else {
        $state.go(state, params);
      }
    }; 

    var goBack = function () {
      var viewCount = 1;
      if(redirect.prev) {
        var history = $ionicHistory.viewHistory();
        if(redirect.prev !== history.backView.stateId) {
          var histId = $ionicHistory.currentHistoryId();
          var hist = history.histories[histId];
          for(;viewCount < hist.stack.length; viewCount++) {
            var curr = hist.stack[hist.stack.length - 1 - viewCount];
            if(curr.stateId === redirect.prev) {
              break;
            }
          }
        }
        redirect = {};
      }
      $ionicHistory.goBack(0 - viewCount);

      satisfyLoginSuccessCallback();
    };

    $ionicPlatform.registerBackButtonAction(goBack, 101);

    var ensureLogin = function (cb) {
      var user = User.get();
      if(!user) {
        loginSuccess = cb;
        go('app.login');
      } else {
        Terms.ensure(function() {
          cb(true);
        }, function(err) {
          console.log('Terms & Conditions are out of date!');
          console.log(err);
        });
      }
    };

    var toggleMenu = function() {
      if($ionicSideMenuDelegate.isOpenLeft()) {
        closeMenu();
        return false;
      } else {
        openMenu();
        return true;
      }
    };

    var closeMenu = function() {
      $ionicSideMenuDelegate.toggleLeft(false);
    };

    var openMenu = function() {
      $ionicSideMenuDelegate.toggleLeft(true);
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
      spec.$timeout = spec.$timeout || setTimeout;
      if(!spec.scrollHandle) { 
        console.log('Warning: Spec.scrollHandle is needed to avoid controlling all scrolls');
      }

      var scrollTop = function() {
        var delegate = $ionicScrollDelegate;
        if(spec.scrollHandle) {
          delegate = delegate.$getByHandle(spec.scrollHandle);
        }
        spec.$timeout(function () {
          delegate.scrollTop(false);
        });
      };

      var getPosition = function() {
        var delegate = $ionicScrollDelegate;
        if(spec.scrollHandle) {
          delegate = delegate.$getByHandle(spec.scrollHandle);
        }
        return delegate.getScrollPosition();
      };

      var getBottom = function () {
        var delegate = $ionicScrollDelegate;
        if(spec.scrollHandle) {
          delegate = delegate.$getByHandle(spec.scrollHandle);
        }
        var view = delegate.getScrollView();
        return view.options.getContentHeight() - view.__contentHeight;
      };

      var resize = function () {
        var delegate = $ionicScrollDelegate;
        if(spec.scrollHandle) {
          delegate = delegate.$getByHandle(spec.scrollHandle);
        }
        spec.$timeout(function () {
          delegate.resize();
        });
      };

      var getScrollDelegate = function () {
        var delegate = $ionicScrollDelegate;
        if(spec.scrollHandle) {
          delegate = delegate.$getByHandle(spec.scrollHandle);
        }
        return delegate;
      };

      var anchorScroll = function (anchor) {
        spec.$timeout(function () {
          document.getElementById(anchor).scrollIntoView();
        });
        /*
         * TODO Find source of scrolling from top bug
         * then use animated ionic scrolling
         if(spec.$location) {
         spec.$location.hash(anchor);
         } else {
           console.log('Warning: Since Spec.$location is not set it is up to the user to call $location.hash' +
                      'on the anchors before calling Navigate.anchorScroll(anchor)');
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
            var top = scroll.oldPosition.top;
            spec.$timeout(function () {
              getScrollDelegate().scrollTo(0, top, animate);
            });
          }
          scroll.oldPosition = null;
        } else {
          scroll.oldPosition = getScrollDelegate().getScrollPosition();
          anchorScroll(anchor);
          scroll.currentPosition = null;
          spec.$timeout(function () {
            scroll.currentPosition = getScrollDelegate().getScrollPosition();
          }, 1000);
        }
      };
      
      return {
        getBottom: getBottom,
        scrollTop: scrollTop,
        getPosition: getPosition,
        resize: resize,
        anchorScroll: anchorScroll,
        toggleAnchorScroll: toggleAnchorScroll,
        //   onScroll: onScroll,
      };
    };

    return {
      scroll: scroll,
      toggleMenu: toggleMenu,
      openMenu: openMenu,
      closeMenu: closeMenu,
      focus: focus,
      go: go,
      goBack: goBack,
      goOrGoBack: goOrGoBack,
      ensureLogin: ensureLogin,
      disableNextBack: disableNextBack
    };
  }
]);
