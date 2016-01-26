
'use strict';
var app = angular.module('instanews.service.notifications', ['ionic', 'ngResource','ngCordova']);

/* istanbul ignore next */
app.service('Notifications', [
  '$rootScope',
  '$cordovaPush',
  'Articles',
  'Comments',
  'Journalist',
  'list',
  'Platform',
  'Subarticles',
  'User',
  '$filter',
  function(
    $rootScope,
    $cordovaPush,
    Articles,
    Comments,
    Journalist,
    list,
    Platform,
    Subarticles,
    User,
    $filter
  ){
    console.log('Setting up notifications!!!!');
    //NOTIFICATION STUFF FROM APP.JS
    /*
       $scope.notifications = [];

       var updateNotifications = function() {
       $scope.notifications = Notifications.get();
       }; 

    //Notifications.registerObserver(updateNotifications);
    */
    /*
       $scope.handleNotification = function(note) {
       if(note.notifiableType === 'article') {
       $state.go('app.article',{ id: note.notifiableId});
       }
       else {
       $state.go('app.notif', { id: note.id});
       }
       Navigate.toggleMenu();
       note.seen = true;

       Journalist.notifications.updateById({
id: $scope.user.username,
fk: note.id,
},note ).$promise
.then(function(res) {
console.log('Notification updated: ' + res);
});
};
*/

    /*
       var loadNotifications = function() {
       if( $scope.user && $scope.user.username ){
       var filter = {
limit: 25,
skip: 0,
order: 'date DESC',
};

Journalist.prototype$__get__notifications({
id: $scope.user.username,
filter: filter
}).$promise
.then( function(res) {
Notifications.set(res);
});
}
else {
console.log('Cannot load notifications because user is not set yet');
}
};
*/

    Platform.ready.then( function () {
      console.log('Setting up notifications!');
      var config = {};

      var device = Platform.getDevice();

      if(Platform.isAndroid()) {
        config = {
          android: {
            sound: true,
            vibrate: true,
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

      console.log('Attempting to register device for push notifications');
      // jshint undef: false 
      var push = PushNotification.init(config);

      push.on('registration', function(data) {
        console.log('Registered: ' + data.registrationId);
        device.token = data.registrationId;
        Platform.setDevice(device);
        User.install();
      });

      push.on('notification', function(data) {
        console.log(data);
        console.log(data.additionalData);
        if(data.additionalData) {
          if(data.additionalData.foreground) {
            reload();
            //TODO update badge
          } else {
            focus(data.additionalData);
          }
        }
      });
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
      var data = data || this;
      switch(data.notifiableType) {
        case 'subarticle':
          Subarticles.focusById(data.notifiableId);
          break;
        case 'article':
          Articles.focusById(data.notifiableId);
          break;
        case 'comment':
          Comments.focusById(data.notifiableId);
          break;
        default:
          console.log('Unknown notification type!');
          break;
      }

      setSeen(data);
    };

    var reload = function () {
      if(user) {
        console.log('Loading notifications!');
        spec.options.filter.skip = 0;
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
        //TODO update badge
      };

      if(data.save && typeof data.save === 'function') {
        data.seen = true;
        data.save();
      } else {
        data.id = data.id || data.myId;
        if(data.id) {
          data.seen = true;
          save(data);
          notifications.add(data);
        } else {
          console.log('No save function or id! Cannot set "seen"');
        }
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
        Journalist.prototype$__updateById__notifications({
          id: user.userId,
          fk: item.id
        },
        {
          seen: item.seen
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

    var spec = {};
    spec.save = save;
    spec.focus = focus;

    spec.find = Journalist.prototype$__get__notifications;
    spec.update = update;
    spec.options = spec.options || {};
    spec.options.filter = {
      order: 'created DESC' 
    };

    // Create a list for articles within view
    var notifications = list(spec);

    var user;

    var userWatch = function () {
      user = User.get();
      if(user) {
        reload();
      } else {
        notifications.clear();
      }
    };

    User.registerObserver(userWatch);

    userWatch();

    console.log('Notifications fully loaded!');
    console.log(notifications);

    return notifications;
  }
]);
