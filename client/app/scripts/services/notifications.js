
'use strict';
var app = angular.module('instanews.service.notifications', ['ionic', 'ngResource','ngCordova']);

/* istanbul ignore next */
app.service('Notifications', [
  '$rootScope',
  '$cordovaPush',
  'Articles',
  'Comments',
  'DownVote',
  'Journalist',
  'list',
  'Notif',
  'Platform',
  'Subarticles',
  'User',
  'UpVote',
  '$filter',
  function(
    $rootScope,
    $cordovaPush,
    Articles,
    Comments,
    DownVote,
    Journalist,
    list,
    Notif,
    Platform,
    Subarticles,
    User,
    UpVote,
    $filter
  ){
    var setExternalBadge = function () {};

    Platform.ready.then( function () {
      var config = {};

      var device = Platform.getDevice();


      if(Platform.isAndroid()) {
        config = {
          android: {
            sound: true,
            vibrate: true,
            forceShow: true,
            icon: 'notif',
            iconColor: '#023E4F',
            senderID: '1081316781214'
          }
        };
        device.type = 'android';
      }
      else if(Platform.isIOS()) {
        config = {
          ios: {
            badge: true,
            sound: true,
            alert: true
          }
        };
        device.type = 'ios';
      }
      else {
        console.log('Cannot register! Unknown device!');
        return;
      }

      // jshint undef: false 
      //TODO Defer this until the first time a user logs in to avoid asking for permission right after download
      console.log('Attempting to register device for push notifications');
      var push = PushNotification.init(config);

      push.on('registration', function(data) {
        console.log('Registered: ' + data.registrationId);
        device.token = data.registrationId;
        Platform.setDevice(device);
        User.install();
      });

      push.on('notification', function(data) {
        console.log(data.additionalData);
        badge.increment();
        if(data.additionalData) {
          if(!data.additionalData.save) {
            data.additionalData.id = data.additionalData.id || data.additionalData.myId;
            notifications.add(data.additionalData);
          }

          if(data.additionalData.foreground) {
            if(Platform.isIOS()) {
              var note = data.additionalData;
              Platform.showConfirm(note.message, 'Notification', ['Ok', 'View'], function (button) {
                if(button === 2) {
                  console.log('View was pressed');
                  focus(note);
                }
              });
            }
          } else {
            focus(data.additionalData);
          }
        }
      });

      setExternalBadge = function () {
        if(Platform.isIOS()) {
          var succ = function () {
            console.log('Successfully set the badge number');
          };

          var fail = function (err) {
            console.log('Failed to set badge number');
            console.log(err);
          };

          var num = 0;
          if(badge.number > 0) {
            num = badge.number;
          }

          push.setApplicationIconBadgeNumber(succ, fail, num);
        }
      };

      setExternalBadge();
    });

      /*
    var iosPushHandler = function(notification) {
      if(notification.alert) {
        notification.message = notification.alert;
      }
      notifications.push(notification);
      notifyObservers();

      Platform.showAlert(notification.message, 'Notification');
    };

    var androidPushHandler = function(notification) {
      if( notification.event === 'registered' ) {
        Platform.setDeviceToken(notification.regid);
        User.install();
      }
      else if (notification.event === 'message') {
        //Save the notification
        notifications.push(notification);
        notifyObservers();

        Platform.showAlert(notification.message, 'Notification');
      }
      else {
        console.log('Un-handled notification!');
      }
    };
   */

    var focus = function (data) {
      var handleVotable = function(item) { 
        console.log('votable');
        console.log(item);
        switch(item.modelName) {
          case 'subarticle':
            Subarticles.focusById(item.id);
            break;
          case 'comment':
            Comments.focusById(item.id);
            break;
          case 'article':
            Navigate.go('app.article', { id: item.id });
            break;
          default:
            console.log('Unknown votable type!');
            break;
        }
      };

      var data = data || this;
      switch(data.notifiableType) {
        case 'subarticle':
          Subarticles.focusById(data.notifiableId);
          break;
        case 'upVote':
          UpVote.prototype$__get__clickable({ id: data.notifiableId })
          .$promise
          .then(function (res) {
            handleVotable(res);
          }, function (err) {
            console.log(err);
          });
          break;
        case 'downVote':
          DownVote.prototype$__get__clickable({ id: data.notifiableId })
          .$promise
          .then(function (res) {
            handleVotable(res);
          }, function (err) {
            console.log(err);
          });
          break;
        case 'comment':
          Comments.focusById(data.notifiableId);
          break;
        default:
          console.log('Unknown notification type!');
          console.log(data);
          break;
      }

      setSeen(data);
    };

    var reload = function () {
      if(user) {
        console.log('Loading notifications!');
        spec.options.filter.skip = 0;
        spec.options.filter.limit = 30;
        spec.options.id = user.userId;
        notifications.load();
      } else {
        console.log('Cannot load notifications without a user');
      }
    };

    var setSeen = function (data) {
      var data = data || this;

      var finish = function () {
        reload();
      };

      if(!data.seen) {
        if(data.id) {
          data.seen = true;
          save(data);
        } else {
          console.log('No save function or id! Cannot set "seen"');
        }
        badge.decrement();
      }

      setTimeout(finish, 300);
    };

    // Triggered when an item in the list wants to be updated
    var update = function (newValue, oldValue) {
      if( newValue.modified >= oldValue.modified ) {
        oldValue.seen = newValue.seen;
      }
    };

    // Triggered when a new batch of articles wants to be added to the list
    // allows for additional filtering
    /*
    var addFilter = function(notifications) {
      notifications.forEach(function(note) {
        note.focus = focus.bind(note);
      });

      return notifications;
    };

    spec.addFilter = spec.addFilter || addFilter;
   */

    var save = function (item) {
      if(user) {
        item = item || this;
        Notif.setSeen({
          id: item.id
        },
        function () {
          console.log('Successful notification update');
        },
        function (err) {
          console.log(err);
        });
      } else {
        console.log('Cannot save the notification because there is no user');
      }
    };

    var sortingFunction = function (a, b) {
      a = new Date(a.created);
      b = new Date(b.created);
      var res = b - a;

      return res;
    };

    var spec = {};
    spec.save = save;
    spec.focus = focus;
    spec.sortingFunction = sortingFunction;

    spec.find = Journalist.prototype$__get__notifications;
    spec.update = update;
    spec.options = spec.options || {};
    spec.options.filter = {
      order: 'created DESC' 
    };

    // Create a list for articles within view
    var notifications = list(spec);

    var badge = {
      number: 0, 
      set: function (num) {
        if( num !== this.number && num >= 0) {
          this.number = num;
          setExternalBadge();
        }
      },
      increment: function () {
        this.number++;
        setExternalBadge();
      },
      decrement: function () {
        if(this.number > 0) {
          this.number--;
        }
        setExternalBadge();
      },
      clear: function () {
        this.number = 0;
        setExternalBadge();
        User.clearBadge();
      },
      toString: function () {
        if(!this.number || this.number < 0) {
          return "0";
        } else if( this.number >= 1000000) {
          return (Math.floor(this.number/1000000).toString()) + 'M';
        } else if( this.number >= 1000) {
          return (Math.floor(this.number/1000).toString()) + 'k';
        } else {
          return this.number.toString();
        }
      }
    };

    notifications.getBadge = function () {
      return badge;
    };

    notifications.reload = reload;

    var user;

    var userWatch = function () {
      user = User.get();
      if(user) {
        if(user.user) {
          console.log(user.user);
          badge.set(user.user.badge);
        }
        reload();
      } else {
        badge.clear();
        notifications.clear();
      }
    };

    User.registerObserver(userWatch);

    userWatch();

    return notifications;
  }
]);
