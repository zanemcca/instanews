
'use strict';
var app = angular.module('instanews.service.maps', ['ionic', 'ngResource','ngCordova']);

app.service('Maps', [
  'Articles',
  'Position',
  function(
    Articles,
    Position
  ){

    var feedMap, postMap, articleMap;

    var getArticleMap = function() {
      return articleMap;
    };

    var setArticleMap = function(map) {
      articleMap = map;
    };

    var getPostMap = function() {
      return postMap;
    };

    var setPostMap = function(map) {
      postMap = map;
    };

    var getFeedMap = function() {
      return feedMap;
    };

    var setFeedMap = function(map) {
      feedMap = map;
    };

    var heatmap;

    var createGradient = function() {
      var start = {
        h: 0.5,
        s: 1,
        l: 0.5,
        a: 0
      };

      var end = {
        h: 1,
        s: 1,
        l: 0.5,
        a: 1
      };

      var length = 100;

      var gradient = [];
      var rgba = hsla2rgba(start);
      gradient.push(rgbaToString(rgba));
      for(var i = 1; i < length; i++) {
        var weight = i/length;
        var hsla = {
          h: start.h + weight*(end.h -start.h),
          s: start.s + weight*(end.s -start.s),
          l: start.l + weight*(end.l -start.l),
          a: end.a
        };
        rgba = hsla2rgba(hsla);
        gradient.push(rgbaToString(rgba));
      }

      console.log(gradient);
      return gradient;
    };

    var rgbaToString = function(rgba) {
      return ('rgba(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ', ' + rgba.a + ')');
    };

    var hsla2rgba = function(hsl) {
      if( hsl.s === 0) {
        return {
          r: hsl.l*255,
          g: hsl.l*255,
          b: hsl.l*255,
          a: hsl.a
        };
      }
      else {
        var temp1,temp2;

        if( hsl.l < 0.5) {
          temp2 = hsl.l * (1 + hsl.s);
        }
        else {
          temp2 = (hsl.l + hsl.s) - ( hsl.s * hsl.l);
        }

        temp1 = 2 * hsl.l - temp2;

        return {
          r: Math.ceil(255 * hue2rgb(temp1, temp2, hsl.h + (1/3))),
          g: Math.ceil(255 * hue2rgb(temp1, temp2, hsl.h)),
          b: Math.ceil(255 * hue2rgb(temp1, temp2, hsl.h - (1/3))),
          a: hsl.a
        };
      }
    };

    var hue2rgb = function( t1, t2, hue) {
      if( hue < 0 ) {
        hue++;
      }
      else if( hue > 1 ) {
        hue--;
      }

      if((6 * hue) < 1) {
        return (t1 + (t2 - t1) * 6 * hue);
      }
      else if((2 * hue) < 1) {
        return t2;
      }
      else if((3 * hue) < 2) {
        return (t1 + (t2 - t1) * 6 * (2/3 - hue));
      }
      else {
        return t1;
      }
    };

    /*
       var createLinearGradient = function() {
       var start = {
r: 0,
g: 0,
b: 255
};

var end = {
r: 255,
g: 0,
b: 0
};

var length = 14;

var gradient = [];
gradient.push('rgba(' + start.r + ', ' + start.g + ', ' + start.b + ', 0)');
for(var i = 1; i < length; i++) {
var weight = i/length;
var r = Math.floor(start.r + weight*(end.r -start.r));
var b = Math.floor(start.b + weight*(end.b -start.b));
var g = Math.floor(start.g + weight*(end.g -start.g));
gradient.push('rgba(' + r + ', ' + g + ', ' + b + ', 1)');
}
return gradient;
};
*/

    var updateHeatmap = function() {
      var articles = Articles.get();

      var articleHeatArray = [];

      if( !Position.getBounds()) {
        return;
      }

      var total = 0;
      var avg = 0;
      for(var i = 0; i < articles.length; i++) {
        if( articles[i].rating > 0) {
          total += articles[i].rating;
          avg += articles[i].rating/articles.length;
        }
      }

      for(i = 0; i < articles.length; i++) {
        var position = Position.posToLatLng(articles[i].location);
        var rating = articles[i].rating;
        if(rating < 0) {
          rating = 0.1;
        }

        if (Position.withinBounds(position)) {
          console.log(rating*10);
          articleHeatArray.push({
            location: position,
            //weight: 1 - Math.exp(-rating/(2*avg))
            weight: rating*10
          });
        }
      }

      if (!heatmap) {

        heatmap = new google.maps.visualization.HeatmapLayer({
          map: getFeedMap(),
          gradient: createGradient(),
          data: articleHeatArray
        });
      }
      else {
        heatmap.setData(articleHeatArray);
      }
    };

    var localize = function(map, cb) {
      var position = Position.getPosition(); 

      if(setCenter(map, position)) {
        map.setZoom(15);
        if(cb) {
          cb(null, position);
        }
        else {
          console.log('Successful localization!');
        }
      }
      else {
        if(cb) {
          cb('Failed localization!',null);
        }
        else {
          console.log('FAILED localization!');
        }
      }
    };

    var setCenter = function(map, pos) {
      if(pos) {
        map.setCenter(Position.posToLatLng(pos));
        return true;
      }
      return false;
    };

    var fitBounds = function(map, bounds) {
      map.fitBounds(bounds);
    };

    var marker;

    var getMarker = function() {
      return marker;
    };

    var setMarker = function(map, position) {

      if(!marker) {
        var tempMarker = {
          map: map,
          animation: google.maps.Animation.DROP,
          position: Position.posToLatLng(position)
        };

        marker = new google.maps.Marker(tempMarker);
      }
      else {
        marker.setMap(map);
        marker.setPosition(Position.posToLatLng(position));
      }
      marker.setVisible(true);
    };

    var deleteMarker = function() {
      if(marker) {
        marker.setVisible(false);
      }
      else {
        console.log('Marker is invalid! Cannot delete it.');
      }
      return;
    };

    //My Circle =============================================================

    /*
       var myCircle;
       var northPole = new google.maps.LatLng(90.0000, 0.0000);
       var southPole = new google.maps.LatLng(-90.0000, 0.0000);


//Watch our accuracy so that we always know if we hit our limit
$scope.$watch('mPos.accuracy', function(newValue, oldValue) {
if (newValue !== oldValue) {
if (newValue >= $scope.mPos.radius) {
$scope.mPos.limit = true;
$scope.mPos.radius =  newValue;
}
else {
$scope.mPos.limit = false;
}
}
});

//Update our circle and markers when the radius changes
$scope.$watch('mPos.radius', function (newValue, oldValue) {
if (newValue !== oldValue) {
updateMyCircle();
updateMarkers();
}
}, true);

//Update my circle
function updateMyCircle() {
if( !myCircle) {
drawMyCircle();
}

myCircle.setRadius($scope.mPos.radius);
//Update the map to contain the circle
var bounds = myCircle.getBounds();
map.fitBounds(bounds);
//If the bounds contain either the north or south pole then
// move to the equator for the center of the map
if ( bounds.contains(northPole) || bounds.contains(southPole)) {
var equator = new google.maps.LatLng(0.0000, $scope.mPos.lng);
map.setCenter(equator);
}
}

//Draw my circle initially
function drawMyCircle() {
var options = {
strokeColor: 'blue',
strokeOpacity: 0.3,
strokeWeight: 0,
fillColor: 'blue',
fillOpacity: 0.1,
map: map,
center: new google.maps.LatLng($scope.mPos.lat,$scope.mPos.lng)
};
options.radius = $scope.mPos.radius;

myCircle = new google.maps.Circle(options);
map.fitBounds(myCircle.getBounds());
console.log(options.radius);
$scope.mPos.radSlider = Position.radToSlide(options.radius);
}
*/


//MARKERS =============================================================

/*
   var markers = [];
   var articleMarker;

//Update the markers on the map
function updateMarkers() {
if( markers.length === 0) {
getMarkers();
}
angular.forEach( markers, function (marker) {
if (!Position.withinRange({lat: marker.position.k, lng: marker.position.D})) {
marker.setVisible(false);
}
else marker.setVisible(true);
});
}

//Get the markers initially
function getMarkers() {
//TODO only update the changed ones not all
for( var i = 0 ; i < markers.length ; i++) {
markers[i].setMap(null);
}
markers = [];

var tempMarker = {
map: map,
animation: google.maps.Animation.DROP//,
/*
icon: {
size: new google.maps.Size(120, 120),
origin: new google.maps.Point(0, 0),
anchor: new google.maps.Point(0, 20),
scaledSize: new google.maps.Size(30,30)
}
*/
/*           };

             for( var i = 0; i < $scope.articles.length; i++) {
             tempMarker.position = new google.maps.LatLng($scope.articles[i].location.lat, $scope.articles[i].location.lng);
             tempMarker.title = $scope.articles[i].title;
//        tempMarker.icon.url = 'img/ionic.png';

if (!Position.withinRange($scope.articles[i].location)) {
tempMarker.visible = false;
}
markers.push(new google.maps.Marker(tempMarker));
}
}

*/

Articles.registerObserver(updateHeatmap);

return {
  localize: localize,
  setCenter: setCenter,
  setMarker: setMarker,
  getMarker: getMarker,
  deleteMarker: deleteMarker,
  fitBounds: fitBounds,
  setPostMap: setPostMap,
  getPostMap: getPostMap,
  setFeedMap: setFeedMap,
  getFeedMap: getFeedMap,
  getArticleMap: getArticleMap,
  updateHeatmap: updateHeatmap,
  setArticleMap: setArticleMap
};
  }]);
