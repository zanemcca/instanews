
var app = angular.module('instanews.common', ['ionic', 'ngResource', 'ngCordova']);

app.service('Common', [
      '$rootScope',
      '$filter',
      '$ionicSideMenuDelegate',
      '$ionicScrollDelegate',
      '$ionicHistory',
      '$cordovaPush',
      '$cordovaDialogs',
      '$cordovaDevice',
      'Article',
      'Installation',
      'Comment',
      function(
         $rootScope,
         $filter,
         $ionicSideMenuDelegate,
         $ionicScrollDelegate,
         $ionicHistory,
         $cordovaPush,
         $cordovaDialogs,
         $cordovaDevice,
         Article,
         Installation,
         Comment){

   var articles = [];

   var device = {
      type: '',
      token: ''
   };

   var bounds;
   var feedMap, articleMap;

   var getArticleMap = function() {
      return articleMap;
   };

   var setArticleMap = function(map) {
      articleMap = map;
   };

   var getFeedMap = function() {
      return feedMap;
   };

   var setFeedMap = function(map) {
      feedMap = map;
   };

   var user = {};

   var notifications = [];

   var mPosition = {
      lat: 45.61545,
      lng: -66.45270,
      radius: 500,
      accuracy: 0,
      radSlider: 0
   };

   /*
   //Radius Slider
   var RadiusMax = Math.PI*6371000; //Half the earths circumference
   var RadiusMin = 500; //Minimum radius in meters
   var maxSlider = 500; //Slider range from 0 to 100
   var scale = maxSlider / Math.log(RadiusMax - RadiusMin + 1);

   mPosition.radSlider = radToSlide(mPosition.radius);

   $rootScope.$watch( function () {
      return mPosition.radSlider;
   }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
         var radius = slideToRad(newValue);

         if (radius <= mPosition.accuracy) {
            mPosition.radSlider = radToSlide(mPosition.accuracy);
            mPosition.limit = true;
         }
         else {
            mPosition.limit = false;
         }

         mPosition.radius = radius;
      }
   }, true);

   // Conversion functions
   Number.prototype.toRad = function() {
      return this * Math.PI / 180;
   };

   function radToSlide(radius) {
      return (Math.ceil(Math.log(radius - RadiusMin + 1)*scale)).toString();
   }

   function slideToRad(radSlider) {
      var radius =  Math.exp(parseInt(radSlider) / scale) + RadiusMin - 1;
      return radius;
   }
   */

   // Could replace with google API call, but this keeps it local and fast
   var withinRange = function (position) {

      //Method for a square
      if (bounds ) {
         return bounds.contains(position);
      }
      else {
         console.log('Bounds not loaded yet');
         return false;
      }

      //Method for a circle
      /*
      //haversine method
      var mLat = mPosition.lat.toRad();
      var lat = position.lat.toRad();
      var dLat = (mPosition.lat - position.lat).toRad();
      var dLng = (mPosition.lng - position.lng).toRad();

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(mLat) * Math.cos(lat) *
               Math.sin(dLng/2) * Math.sin(dLng/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      //Earths radius is 6371Km

      if ( mPosition.limit ) {
         return (6371000 * c <= mPosition.accuracy);
      }
      else {
         return (6371000 * c <= mPosition.radius);
      }
      */
   };

   //Comments
   var createComment = function (instance, content) {
      var Create = {};
      var model = {};
      if (instance.commentableId ) {
         Create = Comment.prototype$__create__comments;
         model = {
            id: instance.myId,
            content: content,
            commentableId: instance.myId,
            commentableType: "comment"
         };
      }
      else {
         Create = instance.constructor.comments.create;
         model = {
            id: instance.myId,
            content: content,
            commentableId: instance.myId,
            commentableType: instance.constructor.modelName.toLowerCase()
         };
      }

      Create(model)
      .$promise
      .then( function(res, err) {
         instance.comments.push(res);
      });
   };

   var toggleComments = function(instance) {
      if(!instance.showComments) {

         //Comments can have any kind of parent
         //so we check for it before updating
         if ( instance.commentableId ) {
            model = Comment;
         }
         else {
            model = instance.constructor;
         }

         var filter = {
            limit: 10,
            order: 'rating DESC'
         }

         //Retrieve the comments from the server
         model.prototype$__get__comments({id: instance.myId, filter: filter})
         .$promise
         .then( function (res) {
            instance.comments = res;
            instance.showComments = true;
         });
      }
      else {
         instance.showComments = false;
      }
   };

   //Getters
   var getArticle = function (id) {
      var val = $filter('filter')(articles, {myId: id});
      if (val.length > 0) {
         return val[0];
      }
   };

   var setBounds = function(bnds) {
      bounds = bnds;
   };

   var getBounds = function() {
      return bounds;
   }

   var getArticles = function() {
      return articles;
   };

   var setArticles = function(arts) {
      articles = arts;
   };

   var toggleMenu = function() {
      /*
      console.log('Toggling menu');

      if( $ionicSideMenuDelegate.isOpenLeft()) {
         console.log('Open already');
      }
      else {
         console.log('Not Opened');
      }

      */
      $ionicSideMenuDelegate.toggleLeft();
   };


   var userObserverCallbacks = [];

   var registerUserObserver = function(cb) {
      userObserverCallbacks.push(cb);
   };

   var notifyUserObservers = function() {
      angular.forEach(userObserverCallbacks, function(cb) {
         cb();
      });
   };

   var getUser = function() {
      return user.user;
   };

   var setUser = function(usr) {
      user = usr;

      notifyUserObservers();
      install();
   };


   var install = function() {
      if ( user
            && user.user
            && user.user.username
            && device
            && device.type
            && device.token
            && device.token !== 'OK') {
         console.log('Attempting to install device on the server');

         var appConfig = {
            appId: 'instanews',
            userId: user.user.username,
            deviceType: device.type,
            deviceToken: device.token,
            created: new Date(),
            modified: new Date(),
            status: 'Active'
         };

         /*
         if( device.type === 'ios') {
            appConfig.deviceToken =  device.token;
         }
         else if( device.type === 'android') {
            appConfig.deviceToken = $cordovaDevice.getUUID();
         }
         */

         Installation.create(appConfig, function (err, result) {
            if (err) {
               console.log('Error trying to install device', err);
            }
            else {
               console.log('Created a new device installation : ' , result);
            }
         });
      }
      else {
         console.log('Could not register for notification because of invalid parameters'
               + '\nUser: ' + user
               + '\ndevice.type: ' + device.type
               + '\ndevice.token: ' + device.token);
      }
   };

   $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {

      console.log('Notification recieved');
      if( notification.event === 'registered' ) {
         device.token = notification.regid;
         install();
      }
      else if (notification.event === 'message') {
         //Save the notification
         notifications.push(notification);
         notifyNotificationObservers();

         $cordovaDialogs.alert(notification.message, 'instanews', 'Fuck yeah!')
         .then( function() {
            console.log('Notifcation is confirmed');
         });
      }
      else {
         console.log('Un-handled notification!');
      }
   });

   var disableNextBack = function() {
      $ionicHistory.nextViewOptions({
         disableBack: true
      });
   };

   var scrollTop = function() {
      $ionicScrollDelegate.scrollTop(true);
   };

   var onScroll = function() {
      if($ionicScrollDelegate.getScrollPosition().top > 0) {
         return true;
      }
      else {
         return false;
      }
   };

   var getDevice = function() {
      return device;
   };

   var setDevice = function(dev) {
      device = dev;
   };


   var getNotifications = function() {
      return notifications;
   };

   var setNotifications = function(notes) {
      notifications = notes;
      notifyNotificationObservers();
   };

   var notificationObserverCallbacks = [];

   var registerNotificationObserver = function(cb) {
      notificationObserverCallbacks.push(cb);
   };

   var notifyNotificationObservers = function() {
      angular.forEach(notificationObserverCallbacks, function(cb) {
         cb();
      });
   };

   return {
      toggleMenu: toggleMenu,
      scrollTop: scrollTop,
      onScroll: onScroll,
      disableNextBack: disableNextBack,
      getArticles: getArticles,
      setArticles: setArticles,
      getUser: getUser,
      setUser: setUser,
      registerUserObserver: registerUserObserver,
      setFeedMap: setFeedMap,
      getFeedMap: getFeedMap,
      getArticleMap: getArticleMap,
      setArticleMap: setArticleMap,
      getArticle: getArticle,
//      radToSlide: radToSlide,
      setBounds: setBounds,
      getBounds: getBounds,
      setDevice: setDevice,
      getDevice: getDevice,
      setNotifications: setNotifications,
      getNotifications: getNotifications,
      registerNotificationObserver: registerNotificationObserver,
      mPosition: mPosition,
      withinRange: withinRange,
      createComment: createComment,
      toggleComments: toggleComments,
   };
}]);
