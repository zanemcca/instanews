
var app = angular.module('instanews.common', ['ionic', 'ngResource']);

app.service('Common', [
      '$rootScope',
      '$filter',
      'Article',
      'Comment',
      function($rootScope, $filter, Article, Comment){

   //Initialize and refresh
   var articles = Article.find();
   var bounds;

   var user = {};

   var mPosition = {
      lat: 45.61545,
      lng: -66.45270,
      radius: 500,
      accuracy: 0,
      radSlider: 0
   };

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
      instance.constructor.comments.create({
         id: instance.myId,
         content: content,
         commentableId: instance.myId,
         commentableType: instance.constructor.modelName.toLowerCase()
      })
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

         //Retrieve the comments from the server
         model.prototype$__get__comments({id: instance.myId})
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

   return {
      articles: articles,
      user: user,
      getArticle: getArticle,
      radToSlide: radToSlide,
      setBounds: setBounds,
      getBounds: getBounds,
      mPosition: mPosition,
      withinRange: withinRange,
      createComment: createComment,
      toggleComments: toggleComments,
   };
}]);
