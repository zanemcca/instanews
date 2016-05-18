
'use strict';
var app = angular.module('instanews.service.platform', ['ionic', 'ngCordova']);

var handle = {};
//jshint ignore:start 
function DeepLinkHandler(data) {
  console.log('Deep link handler');
  console.log(JSON.stringify(data));
  if(handle.deeplink) {
    handle.deeplink(data);
  } else {
    console.log('deeplink not set yet!');
  }
}
//jshint ignore:end 

app.run(function(
  Comments,
  Navigate,
  Platform,
  Subarticles
) {
  handle.deeplink = function(data) {
    Platform.loading.show();
    switch(data.focusType) {
      case 'subarticle':
        Subarticles.focusById(data.focusId);
        break;
      case 'comment':
        Comments.focusById(data.focusId);
        break;
      case 'article':
        Navigate.go('app.article', { id: data.focusId });
        break;
      default:
        if(data.params) {
          handle.deeplink(data.params);
        } else {
          Platform.loading.hide();
          console.log('Unknown focus type');
          console.log('Possibly a legacy deeplink');
          console.log(data);
        }
        break;
    }
  };
});

//jshint camelcase:false
app.factory('Platform', [
  '$cordovaDevice',
  '$cordovaDialogs',
  '$cordovaFile',
  '$ionicActionSheet',
  '$ionicLoading',
  '$ionicNavBarDelegate',
  '$q',
  'Device',
  'Dialog',
  function(
    $cordovaDevice,
    $cordovaDialogs,
    $cordovaFile,
    $ionicActionSheet,
    $ionicLoading,
    $ionicNavBarDelegate,
    $q,
    Device,
    Dialog
  ) {

    var ready = $q.defer();

    /*
     * Sets or unsets the back button depending on if we are
     * running on a device or in the browser respectivelly
     */
    var initBackButton = function () {
      if(Device.isBrowser()) {
        $ionicNavBarDelegate.showBackButton(false);
      } else {
        $ionicNavBarDelegate.showBackButton(true);
      }
    };

/*
    var device = {
      type: '',
      token: ''
    };

    var getDevice = function() {
      return device;
    };

    var setDevice = function(dev) {
      device = dev;
    };

    var setDeviceToken = function(token) {
      device.token = token;
    };

    var getAppNameLogo = function () {
     //return '<img src="images/favicon.ico"/>stanews'; 
     return 'InstaNews'; 
    };

    var getUUID = function() {
      if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        return $cordovaDevice.getUUID();
      }
      return;
    };

    var isIOS = function() {
      return ionic.Platform.isIOS();
    };

    var isAndroid = function() {
      return ionic.Platform.isAndroid();
    };

    var isAndroid6 = function() {
      var version = ionic.Platform.version();
      console.log(version);
      return (isAndroid() && ionic.Platform.version() >= 6);
    };

    var isBrowser = function() {
      var ip = ionic.Platform;
      if((ip && window.cordova) || ENV.name === 'development') {
        if(ip.isIOS() || ip.isAndroid() || ip.isWindowsPhone()) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    };

    var isMobile = function() {
      var ip = ionic.Platform;
      return (ip && (ip.isIOS() || ip.isAndroid() || ip.isWindowsPhone()));
    };


    var showToast = function(message) {
      if(!isBrowser()) {
        setTimeout( function() {
          window.plugins.toast.showShortCenter(message);
        }, 250);
      }
      console.log(message);
    };

    var showSheet = function(sheet) {
      $ionicActionSheet.show(sheet);
    };

    //TODO Use angular material or ionic for alerts
    var showAlert = function (message, title, buttonName, cb) {
      if(!cb) {
        cb = buttonName;
        if(!cb) {
          buttonName = 'Ok';
          cb = title;
          if(!cb) {
            title = 'Alert';

            cb = function () {
              console.log('Dialog was confirmed');
            };
          } else if (typeof cb === 'function') {
            title = 'Alert';
          }
        } else if (typeof cb === 'function') {
          buttonName = 'Ok';
        }
      }

      $cordovaDialogs.alert(message, title, buttonName)
      .then(cb);
    };

    var showConfirm = function (message, title, buttonNames, cb) {
      if(!cb) {
        cb = buttonNames;
        if(!cb) {
          buttonNames = ['Ok', 'Cancel'];
          cb = title;
          if(!cb) {
            title = 'Confirm';

            cb = function () {
              console.log('Dialog was confirmed');
            };
          } else if (typeof cb === 'function') {
            title = 'Confirm';
          }
        } else if (typeof cb === 'function') {
          buttonNames = ['Ok', 'Cancel'];
        }
      }

      $cordovaDialogs.confirm(message, title, buttonNames)
      .then(cb);
    };

    //TODO Use angular material or ionic for prompts 
    var showPrompt = function (message, title, buttonNames, defaultText,  cb) {
      if(!cb) {
        cb = defaultText;
        if(!cb) {
          defaultText = 'Type here';
          cb = buttonNames;
          if(!cb) {
            buttonNames = ['Ok', 'Cancel'];
            cb = title;
            if(!cb) {
              title = 'Confirm';

              cb = function () {
                console.log('Dialog was confirmed');
              };
            } else if (typeof cb === 'function') {
              title = 'Confirm';
            }
          } else if (typeof cb === 'function') {
            buttonNames = ['Ok', 'Cancel'];
          }
        } else if (typeof cb === 'function') {
          defaultText = 'Type here';
        }
      }

      $cordovaDialogs.prompt(message, title, buttonNames, defaultText)
      .then(cb);
    };

    var getDataDir = function() {
      return cordova.file.dataDirectory;
    };

    var getCacheDir = function() {
      return cordova.file.cacheDirectory;
    };

    var isCameraPresent = function () {
      return (navigator.camera && navigator.camera.getPicture);
    };

    var isVideoPresent = function () {
      return (navigator.device && navigator.device.capture && navigator.device.capture.captureVideo);
    };

    var scrollBarWidth = -1;
    var getScrollBarWidth = function() {
      if(scrollBarWidth < 0) {
        var inner = document.createElement('p');
        inner.style.width = '100%';
        inner.style.height = '200px';

        var outer = document.createElement('div');
        outer.style.position = 'absolute';
        outer.style.top = '0px';
        outer.style.left = '0px';
        outer.style.visibility = 'hidden';
        outer.style.width = '200px';
        outer.style.height = '150px';
        outer.style.overflow = 'hidden';
        outer.appendChild (inner);

        document.body.appendChild (outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 === w2) {
          w2 = outer.clientWidth;
        }

        document.body.removeChild (outer);

        scrollBarWidth = (w1 - w2);
      }
      return scrollBarWidth;
    };

    var getWidth = function () {
      return window.innerWidth;
    }; 

    var getMaxImageDimensions = function () {
      var res = {
        height: 0,
        width: 0
      };

      var width = getWidth() - getScrollBarWidth();
      if(width >= 768) {
        res.width = 600;
      } else if(isTablet()) {
        res.width = Math.round(width*0.8);
      } else {
        res.width = width - 20;
      }

      var max = Math.max(window.innerWidth, window.innerHeight);
      if(max < 500) {
        res.height = 300;
      } else if(max < 600) {
        res.height = 500;
      } else if(max < 700) {
        res.height = 600;
      } else if(max < 800) {
        res.height = 700;
      } else {
        res.height = 800;
      }
      return res;
    };

    var isLandscape = function () {
      var isLandscape = false;
      if(typeof(window.orientation) === 'number') {
        isLandscape = (window.orientation % 180);
      } else {
        isLandscape = (window.innerHeight < window.innerWidth);
      }

      return isLandscape;
    };

    var getDeviceType = function () {
      var height = Math.max(window.innerHeight, window.innerWidth);
      var type = 'phone';
      if(height  >= 900) {
        type = 'tablet';
      }
      return type;
    };

    // Screen size logic
    var getSizeClass = function (max) {
      var pr = window.devicePixelRatio;
      var sizeClass;
      switch(getDeviceType()) {
        case 'phone':
          sizeClass = Math.floor(pr -1);
        break;
        case 'tablet':
          sizeClass = Math.ceil(pr*3/2);
        break;
        default:
          sizeClass = 0;
        break;
      }

      if(max || max === 0) {
        sizeClass = Math.min(sizeClass, max);
      }
      return sizeClass;
    };

    var getSizeClassPrefix = function (max) {
      var sizes = ['XS','S','M','L'];
      if(max) {
        max = Math.min(sizes.length -1, max);
      } else {
        max = 0;
      }

      return sizes[getSizeClass(max)];
    };

    var isTablet = function () {
      return 'tablet' === getDeviceType();
    };
    */

    /* Initialization */
    if(Device.isBrowser()) {
      console.log('App is running in the browser!');
      ready.resolve();
    }
    else {
      ionic.Platform.ready( function( device ) {
        /* jshint undef:false */
        if(navigator.connection && navigator.connection.type === Connection.NONE) {
          Dialog.alert('Instanews is unavailable offline. Please try again later', 'Sorry', function () {
            if(navigator.app) {
              navigator.app.exitApp();
            }
          });
        } else {
          setTimeout(function () {
            ready.resolve( device);
          });

          setTimeout(function () {
            console.log('Splashscreen timeout');
            if(navigator.splashscreen) {
              navigator.splashscreen.hide();
            }
          }, 5000);
        }
      });
    }

    var keyboard = {
      hide: function () {
        if(window.cordova && cordova.plugins && cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.close();
        }
      },
      show: function () {
        if(window.cordova && cordova.plugins && cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.show();
        }
      }
    };

    var loading = {
      show: function () {
        if(Device.isMobile()) {
          if(!loading.loader ) {
             loading.loader = $ionicLoading.show({
              delay: 100,
              template: 'Loading...'
            });
            return loading.loader;
          }
        }
      },
      hide: function () {
        if(Device.isMobile()) {
          if(loading.loader) {
            $ionicLoading.hide();
            loading.loader = null;
          }
        }
      }
    };

    var analytics = {
      init: function () {
        if(window.analytics) {
          if(Device.isAndroid()) {
            window.analytics.startTrackerWithId('UA-74478035-1');
          } else if(Device.isIOS()) {
            window.analytics.startTrackerWithId('UA-74478035-3');
          } else {
            return console.log('Error: Failed to start analytics!');
          }

          window.analytics.enableUncaughtExceptionReporting(true, function () {
            console.log('Successfully set up analytics uncaughtExceptionReporting!');
          }, function (err) {
            console.log(err.stack);
          });

        } else {
          //Browser version
          (function(i,s,o,g,r,a,m){
            i.GoogleAnalyticsObject = r;
            i[r] = i[r] || function(){
              (i[r].q = i[r].q || []).push(arguments);
            };
            i[r].l = 1*new Date();
            a = s.createElement(o);
            m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a,m);
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

          window.ga('create', 'UA-74478035-2', 'auto');
          analytics.ga = window.ga;
        }
      },
      setUser: function (userId) {
        if(window.analytics) {
          window.analytics.setUserId(userId, function () {
            console.log('Successfully set the analytics user to: ' + userId);
          }, function(err) {
            console.log(err.stack);
          });
        } else {
          analytics.ga('set', 'userId', userId);
        }
      },
      trackView: function(name) {
        if(window.analytics) {
          window.analytics.trackView(name, function () {
            console.log('Tracking: ' + name);
          }, function(err) {
            console.log(err.stack);
          });
        } else {
          window.ga('send', 'pageview', name);
        }
      },
      trackException: function(description, isFatal) {
        if(window.analytics) {
          window.analytics.trackException(description, isFatal, function () {}, function(err) {
            console.log(err.stack);
          });
        } else {
          window.ga('send', 'exception', {
            exDescription: description,
            exFatal: isFatal
          });
        }
      },
      trackTiming: function(category, interval, variable, label) {
        if(window.analytics) {
          window.analytics.trackTiming(category, interval, variable, label, function () {
            console.log('Tracking: ' + category + '-' + interval);
          }, function(err) {
            console.log(err.stack);
          });
        } else {
          window.ga('send', 'timing', category, variable, interval, label);
        }
      },
      trackEvent: function(category, action, label, value) {
        if(window.analytics) {
          window.analytics.trackEvent(category, action, label, value, function () {
            console.log('Tracking: ' + category + '-' + action);
          }, function(err) {
            console.log(err.stack);
          });
        } else {
          window.ga('send', 'event', category, action, label, value);
        }
      }
    };

    var branch = { 
      init: function() {
        if(!window.cordova) {
          branch.branch = window.branch;
          var b = branch.branch;

          b.init('key_live_lbo1wHTU65sACNHMqWdJndbdtBfIG34J');
          b.banner({
              icon: 'images/instanews.png',
              title: 'instanews',
              description: 'Crowdsourced Local News',
              phonePreviewText: '(555)-555-5555',
              mobileSticky: true,
              sendLinkText: 'Get the App',
              showBlackberry: false,
              showWindowsPhone: false,
              showKindle: false,
              forgetHide: 7,
              downloadAppButtonText: 'Download'
          }, {});

          branch.createDeepview = function(data ,cb) {
            data = data || {};
            var opts = {
              make_new_link: true,
              open_app: false 
            };

            b.deepview({
              channel: 'mobile_web',
              feature: 'deepview',
              data: data
            }, opts, function(err) {
              if(err) {
                console.log(err);
                cb(err);
              } else {
                console.log('Successful deepview creation!');
                cb();
              }
            });
          };

          // Create viewInApp() to create deepviews and navigate to the app
          if((Device.isIOS() || Device.isAndroid())) { //Compatible mobile devices 
            branch.viewInApp = function (data) {
              branch.createDeepview(data, function(err) {
                if(err) {
                  console.log(err);
                } else {
                  //TODO Change this depending on the b.session.has_app flag 'view in app' vs 'download the app'
                  Dialog.confirm('Get full access to instanews!', 'Want the App?', ['Download', 'Cancel'], b.deepviewCta.bind(b));
                }
              });
            };
          } else { //Browser
            branch.viewInApp = function (data) {
              Dialog.prompt(
                'Enter your iOS or Android phone number and we\'ll text you a download link for the app.',
                'Want full access to instanews?',
                ['Text Me', 'Cancel'],
                '(555)-555-5555',
                function (num) {
                  b.sendSMS(num, data, function(err) {
                    if(err) {
                      console.log('Failed to send text');
                      console.log(err);
                      Dialog.alert('There was an error sending the text message', 'Please try again');
                    }
                  }); 
                }
              );
            };
          }
        } else {
          //jshint undef:false
          branch.branch = Branch;
          Branch.setDebug(true);

          var onResume = function() {
            branch.branch.initSession().then(function (res) {
              console.log(res);
            }).catch(function (err) {
              console.log('Failed to initialize branch!');
              console.log(err);
            });
          };

          document.addEventListener('resume', onResume, false);
          onResume();

          // Call the callback when on a device
          branch.viewInApp = function(data, cb) {
            cb();
          };
        }
      }
    };

    // Initialize the platform
    ready.promise
      .then(function() {
      loading.show();

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        if(Device.isIOS()) {
          console.log('Disabling keyboard scroll!');
          cordova.plugins.Keyboard.disableScroll(true);
        }
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      if (window.Mobihelp) {
        var options = {
          domain: 'instanews.freshdesk.com'
        };

        if(Device.isIOS()) {
          //TODO Get iOS credentials
          options.appKey = 'instanews-2-fca5122354a07cf1c41c7e08e38cd988';
          options.appSecret = '093fc47da209e872dba380fb4f2c9cf226cc5193';
        } else if(Device.isAndroid()) {
          options.appKey = 'instanews-1-66224bdfe44137a2d5272cc8976fbb73';
          options.appSecret = 'f5259266e2fb7076eaca67caecbcf2acf2259866';
        }
        window.Mobihelp.init(options);

        var getUnreadCount = function () {
          support.getUnreadCount(function (count) {
            support.unreadCount = count;
          });
        };

        //Refresh the count every 5 minutes
        setInterval(getUnreadCount, 5*60*1000);
        getUnreadCount();
      }

      analytics.init();
      branch.init();
    });

    var support = {
      unreadCount: 0,
      show: function () {
        if(window.Mobihelp) {
          window.Mobihelp.showSupport();
        }
      },
      showConversations: function () {
        if(window.Mobihelp) {
          window.Mobihelp.showConversations();
        }
      },
      addData: function (key, data, isSensitive) {
        isSensitive = isSensitive || false;
        if(window.Mobihelp) {
          console.log('Adding support data');
          var addOne = function (key, val) {
            window.Mobihelp.addCustomData(function (succ, err) {
              if(succ) {
                if(!isSensitive) {
              //    console.log(key + ': ' + val);
                }
              } else {
                console.log('Failed to write custom data to support');
                console.log(err);
              }
            }, key, val, isSensitive);
          };

          var add =  function(key, obj, parents) {
            if(parents.length < 3) {
              parents.push(key);
              if(typeof obj === 'number' || typeof obj === 'string') {
                addOne(parents.join('.'), obj, isSensitive);
              } else if (typeof obj === 'object') {
                Object.getOwnPropertyNames(obj).forEach(function (val) {
                  add(val, obj[val], parents.slice());
                });
              }
            }
          };

          add(key, data, []);
        }
      },
      setEmail: function (email) {
        if(window.Mobihelp) {
          window.Mobihelp.setUserEmail(email);
        }
      },
      setName: function (name) {
        if(window.Mobihelp) {
          window.Mobihelp.setUserFullName(name);
        }
      },
      getUnreadCount: function (cb) {
        if(window.Mobihelp) {
          window.Mobihelp.getUnreadCountAsync(function (succ, count) {
            if(!succ) {
              console.log('Failed to get the unread count');
              count = 0;
            }
            cb(count);
          });
        }
      },
      clearData: function () {
        if(window.Mobihelp) {
          window.Mobihelp.clearCustomData(function (succ, err) {
            if(!succ) {
              console.log('Failed to clear custom support data!');
              console.log(err);
            } else {
              console.log('Cleared custom support data');
            }
          });
        }
      },
      clearUser: function () {
        if(window.Mobihelp) {
          window.Mobihelp.clearUserData();
          support.unreadCount = 0;
        }
      },
      clear: function () {
        support.clearData();
        support.clearUser();
      }
    };


    var url = {
      getQuery: function($location) {
        var query = $location.search();
        query = { //Clone the query
          search: query.search,
          loc: query.loc
        };

        if(query.search) {
          query.search = query.search.replace(/__/g, ',_').replace(/_/g, ' ');
        }

        if(query.loc) {
          try {
            var coords = query.loc.split(',');
            var pos = {
              lat: parseFloat(coords[0]),
              lng: parseFloat(coords[1])
            };
            var zoom = coords[2].slice(0,-1);
            zoom = parseFloat(zoom);

            query.loc = {
              pos: pos,
              zoom: zoom
            };
          } catch(e) {
            console.log(e);
            console.log(loc);
            query.loc = null;
          }
        }
        return query;
      },
      setQuery: function($location, query, replace) {
        var modified = false;
        var q = $location.search();
        for(var key in query) {
          var val = query[key];
          if(val === '' || val === null) {
            val = null;
          } else if(key === 'search') {
            val = val.replace(/\s+/gi, '_').replace(/,_/g, '__');
          } else if(key === 'loc') {
            if(val.pos && val.pos.lat && val.pos.lng && val.zoom) {
              var coord = (Math.round(1e7*val.pos.lat)/1e7).toString();
              coord += ',' + (Math.round(1e7*val.pos.lng)/1e7).toString();
              coord += ',' + val.zoom.toString() + 'z';
              val = coord;
            } else {
              console.log('Invalid location given for the query!');
              console.log(val);
              continue;
            }
          }
          if(q[key] !== val) {
            modified = true;
            $location.search(key, val);
            if(replace) {
              $location.replace();
            }
          }
        }
        return modified;
      },
      getParam: function(art) {
        var removeBrackets = function(input) {
          return input
                .replace(/{+.*?}+/g, '')
                .replace(/\[+.*?\]+/g, '')
                .replace(/\(+.*?\)+/g, '')
                .replace(/<.*?>/g, '');
        };

        var preprocess = removeBrackets(art.title);
        var split = preprocess.split(' ');
        var words = [];
        for(var i in split) {
          var wrd = split[i];
          if(!wrd.match(/[^\w\s]/gi)) { //Words must not contain special characters
            if(wrd.match(/^[A-Z0-9]/g)) { //Words must start with a capital letter
              words.push(wrd);
            }
          }
        }
        words.push(art.id);
        return words.join('-');
      },
      getId: function(param) {
        if(param) {
          var split = param.split('-');
          if(split.length) {
            return split[split.length -1];
          }
        }
        console.log('Param is empty!');
        return '';
      }
    };

    var numToString = function(num) {
      num = num || this.number;
      if(!num || num < 0) {
        return '0';
      } else if( num >= 1000000) {
        return (Math.floor(num/1000000).toString()) + 'M';
      } else if( num >= 1000) {
        return (Math.floor(num/1000).toString()) + 'k';
      } else {
        return num.toString();
      }
    };

    //TODO Move to FileTransfer
    var removeFile = function (name, cb) {
      //TODO Add a directory option
      $cordovaFile.removeFile(Device.getDataDir(), name)
      .then(function () {
        cb();
      }, cb);
    };

    var isAuthorized = function(runtime, succ, err) {
      var runtimes = [];
      if(Array.isArray(runtime)) {
        runtimes = runtime;
      } else {
        runtimes.push(runtime);
      }

      if(Device.isAndroid6() && !Device.isBrowser()) {
        cordova.plugins.diagnostic.getPermissionsAuthorizationStatus( function(statuses) {
          var res = true;
          for(var runtime in statuses) {
            res = res && (statuses[runtime] === cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED);
          }

          succ(res);
        }, err, runtimes);
      } else {
        console.log('Cannot check permission from browser');
        succ(true);
      }
    };

    var requestAuthorization = function (runtime, succ, error) {
      var runtimes = [];
      if(Array.isArray(runtime)) {
        runtimes = runtime;
      } else {
        runtimes.push(runtime);
      }

      if(Device.isAndroid6() && !Device.isBrowser()) {
        isAuthorized(runtimes, function (authorized) {
          if(authorized) {
            succ(true);
          } else {
            cordova.plugins.diagnostic.requestRuntimePermissions(function (statuses) {
              var res = true;
              var deniedAlways = false;
              for(var runtime in statuses) {
                res = res && (statuses[runtime] === cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED);
                deniedAlways = deniedAlways || (statuses[runtime] === cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS);
              }

              if(deniedAlways) {
                Dialog.confirm('We need your help changing your permissions', 'Go to Settings', function (idx) {
                  if(idx === 1) {
                    cordova.plugins.diagnostic.switchToSettings( function() {
                      isAuthorized(runtimes, succ, error);
                    }, error);
                  } else {
                    succ(false);
                  }
                });
              } else {
                succ(res);
              }
            }, error, runtimes);
          }
        }, error); 
      } else {
        console.log('Cannot request permission from browser');
        succ(true);
      }
    };

    var permissions = {
      location: {
        isAuthorized: function (succ, error) {
          if(!Device.isBrowser()) {
            cordova.plugins.diagnostic.isLocationAuthorized(succ, error);
          } else {
            console.log('Cannot check permission from browser');
            succ(true);
          }
        },
        requestAuthorization: function (succ, error) {
          if(!Device.isBrowser()) {
            permissions.location.isAuthorized(function (authorized) {
              if(authorized) {
                succ(true);
              } else {
                cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                  if(status === cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED) {
                    succ(true);
                  } else if(status === cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS) {
                    Dialog.confirm('We need your help changing your location permissions', 'Go to Settings', function (idx) {
                      if(idx === 1) {
                        cordova.plugins.diagnostic.switchToSettings( function() {
                          permissions.location.isAuthorized(succ, error);
                        }, error);
                      } else {
                        succ(false);
                      }
                    });
                  } else {
                    succ(false);
                  }
                }, error);
              }
            }, error); 
          } else {
            console.log('Cannot request permission from browser');
            succ(true);
          }
        }
      }
    };

    if(Device.isAndroid6() && !Device.isBrowser()) {
      permissions.storage = {
        isAuthorized: isAuthorized.bind(this, [
          cordova.plugins.diagnostic.runtimePermission.READ_EXTERNAL_STORAGE,
          cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE
        ]),
        requestAuthorization: requestAuthorization.bind(this, [
          cordova.plugins.diagnostic.runtimePermission.READ_EXTERNAL_STORAGE,
          cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE
        ]) 
      };
    } else {
      permissions.storage = {
        isAuthorized: function (succ) {
          succ(true);
        },
        requestAuthorization: function (succ) {
          succ(true);
        }
      };
    }

    return {
      getAppNameLogo: Device.getAppNameLogo,
      getUUID: Device.getUUID,
      getDataDir: Device.getDataDir,
      getCacheDir: Device.getCacheDir,
      showSheet: Dialog.sheet,
      showAlert: Dialog.alert,
      showConfirm: Dialog.confirm,
      showPrompt: Dialog.prompt,
      showToast: Dialog.toast,
      isIOS: Device.isIOS,
      isAndroid: Device.isAndroid,
      isAndroid6: Device.isAndroid6,
      isBrowser: Device.isBrowser,
      isMobile: Device.isMobile,
      isCameraPresent: Device.isCameraPresent,
      isVideoPresent: Device.isVideoPresent,
      isTablet: Device.isTablet,
      isLandscape: Device.isLandscape,
      getWidth: Device.getWidth,
      getMaxImageDimensions: Device.getMaxImageDimensions,
      getDevice: Device.getDevice,
      setDevice: Device.setDevice,
      setDeviceToken: Device.setDeviceToken,
      getSizeClassPrefix: Device.getSizeClassPrefix,
      //All of the above should be deprecated out of platform
      url: url,
      permissions: permissions,
      support: support,
      analytics: analytics,
      branch: branch,
      keyboard: keyboard,
      loading: loading,
      removeFile: removeFile,
      initBackButton: initBackButton,
      numToString: numToString,
      ready: ready.promise
    };
  }
]);
