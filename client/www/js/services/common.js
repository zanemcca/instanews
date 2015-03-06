
var app = angular.module('instanews.common', ['ionic', 'ngResource']);

app.service('Common', ['$rootScope','$filter','Article', function($rootScope, $filter, Article){

   var articles = Article.find();

   var onRefresh = function () {
      Article.find( function (res) {
         article = res;
         $rootScope.$broadcast('scroll.refreshComplete');
      });
   }

   var mPosition = {
      lat: 45.61545,
      lng: -66.45270,
      radius: 500,
      accuracy: 0,
      radSlider: 0
   }

   var RadiusMax = Math.PI*6371000; //Half the earths circumference
   var RadiusMin = 500; //Minimum radius in meters
   var maxSlider = 100; //Slider range from 0 to 100
   var scale = maxSlider / Math.log(RadiusMax - RadiusMin + 1);

   mPosition.radSlider = radToSlide(mPosition.radius);

   function radToSlide(radius) {
      return (Math.ceil(Math.log(radius - RadiusMin + 1)*scale)).toString();
   }

   function slideToRad(radSlider) {
      var radius =  Math.exp(parseInt(radSlider) / scale) + RadiusMin - 1;
      return radius;
   }

   $rootScope.$watch( function () {
      return mPosition.radSlider;
   }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
         var radius = slideToRad(newValue);

         if (radius < mPosition.accuracy) {
            mPosition.radSlider = radToSlide(mPosition.accuracy);
            mPosition.limit = true;
         }
         else {
            mPosition.radius = radius;
            mPosition.limit = false;
         }
      }
   }, true);

   Number.prototype.toRad = function() {
      return this * Math.PI / 180;
   }

   var withinRange = function (position) {
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

   //   console.log('Distance = '+ 6371 * c + ' km\tRadius = ' + mPosition.radius/1000 + ' km');
      if ( mPosition.limit ) {
         return (6371000 * c <= mPosition.accuracy)
      }
      else {
         return (6371000 * c <= mPosition.radius)
      }
   }

   var upvote = function (Model, instance) {
      Model.prototype$upvote({id: instance.myId})
      .$promise
      .then( function (res) {
         instance._votes = res.instance._votes;
      });
   }

   var downvote = function (Model, instance) {
      Model.prototype$downvote({id: instance.myId})
      .$promise
      .then( function (res) {
         instance._votes = res.instance._votes;
      });
   }

   var newId = function() {
      var ret = Math.floor(Math.random()*Math.pow(2,32));
      return ret;
   }

   var createComment = function (Model, instance,instanceType, content) {
      Model.comments.create({
         id: instance.myId,
         content: content,
         commentableId: instance.myId,
         commentableType: instanceType
      })
      .$promise
      .then( function(res, err) {
         instance.comments.push(res);
      });
   }

   var toggleComments = function(Model, instance) {
      if(!instance.showComments) {
         Model.prototype$__get__comments({id: instance.myId})
         .$promise
         .then( function (res) {
            instance.comments = res;
            instance.showComments = true;
         });
      }
      else {
         instance.showComments = false;
      }
   }

   var getArticle = function (id) {
      var val = $filter('filter')(articles, {myId: id});
      if (val.length > 0) {
         return val[0];
      }
   }

   return {
      articles: articles,
      getArticle: getArticle,
      onRefresh: onRefresh,
      mPosition: mPosition,
      withinRange: withinRange,
      createComment: createComment,
      toggleComments: toggleComments,
      downvote: downvote,
      upvote: upvote
   };
}]);
