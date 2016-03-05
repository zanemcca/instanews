
'use strict';
var app = angular.module('instanews.service.preload', []);

function PreloadFactory(Navigate) {
  
  var preload = function (spec) {
    var that;
    if(!spec || !spec.list || !spec.scrollHandle) {
      return console.log('Invalid spec for PreloadFactory');
    }

    spec.sampleTime = spec.sampleTime || 16;

    var scroll = Navigate.scroll(spec);

    //TODO Try to find ideal initial values
    var positions = [{ top:0 }, {top: 0}, {top: 0}];

    var scrollWatcher = setInterval(function () {
      positions.push(scroll.getPosition());
      positions.shift();
      predictScroll(1000);
    }, spec.sampleTime);

    var predictScroll = function (msFromNow) { 
      if(!msFromNow || msFromNow < spec.sampleTime) {
        msFromNow = spec.sampleTime;
      }

      var timeSteps = Math.floor(msFromNow / spec.sampleTime);
      var t2 = timeSteps*timeSteps;

      //The Kinematic Equation
      // S = So + dS/dt*(t-to) + 1/2*d^2S/dt^2*(t-to)^2
      // S(m+n) = (1 + n + n^2)*S(m) - (n + 2*n^2)*S(m-1) + n^2*S(m-2)
      var prediction  = (1 + timeSteps + t2)*positions[2].top;
      prediction += (-(timeSteps + 2*t2))*positions[1].top;
      prediction += t2*positions[0].top;

      console.log('S(m+n): ' + prediction +
                  '\tn: ' + timeSteps +
                    '\tS(m): ' + positions[2].top +
                      '\tS(m-1): ' + positions[1].top + 
                        '\tS(m-2): ' + positions[0].top);

      return prediction;
    };

    var destroy = function () { 
      clearInterval(scrollWatcher);
    };


    // That is the object to be constructed
    // it has privlidged access to my, and spec
    that = {
      predictScroll: predictScroll,
      destroy: destroy
    };

    return that;
  };

  return preload;
}

app.factory('preload', [
  'Navigate',
  PreloadFactory
]);
