'use strict';
//jshint undef: false
var app = angular.module('instanews.service.preload', ['chart.js']);

function PreloadQueueFactory($q) {
  if(!this.that) {
    var queue = [];

    var stats = {
      queueDelay: 0,
      loadDelay: 0,
      getLength: function () { return queue.length; },
      totalProcessed: 0 
    };

    var queueEntryFactory = function(item) {
      var deferred = $q.defer();

      var started = Date.now();

      var entry = {
        item: item,
        resolve: function () {
          //Track queueing time
          var resolving = Date.now();
          entry.queueDelay = resolving - started;
          stats.queueDelay = entry.queueDelay*0.3 + stats.queueDelay*0.7;

          item.preLoad(function(item) {
            //Track loading time
            entry.loadDelay = Date.now() - resolving;
            stats.loadDelay = entry.loadDelay*0.3 + stats.loadDelay*0.7;

            var res = queue.shift();
            if(item.id && res.item.id !== item.id) {
              console.log(item);
              console.log(res);
              console.log('Error: Queue did not remove the write item!');
            }

            deferred.resolve(item);
          });
        },
        promise: deferred.promise
      };

      queue.push(entry);

      if(queue.length === 1) {
        entry.resolve();
      } else {
        //Wait for the previous queue to be flushed
        queue[queue.length - 2].promise.then(function () {
          entry.resolve();
        }, function (err) {
          console.log('Previous preload failed in the queue!');
          console.log(err);
          entry.resolve();
        });
      }

      return deferred.promise;
    };

    var add = function (items) {
      if(!Array.isArray(items)) { 
        return queueEntryFactory(items);
      } else {
        var promises = [];
        for(var i in items) {
          promises.push(queueEntryFactory(items[i]));
        }

        return $q.all(promises);
      }
    };

    this.that = {
      add: add,
      stats: stats
    };
  }
  return this.that;
}

function PreloadFactory(Navigate, Platform, PreloadQueue) {
  var preload = function (spec) {
    var that;
    if(!spec || !spec.list || !spec.scrollHandle) {
      return console.log('Invalid spec for PreloadFactory');
    }

    spec.$timeout = spec.$timeout || setTimeout;

    spec.sampleTime = spec.sampleTime || 16;
    spec.msFromNow = spec.msFromNow || 3000;
    spec.avgTime = spec.avgTime || 500;

    if(!spec.msFromNow || spec.msFromNow < spec.sampleTime) {
      spec.msFromNow = spec.sampleTime;
    }

    var timeSteps = Math.floor(spec.msFromNow / spec.sampleTime);

    var scroll = Navigate.scroll(spec);

    /*
    var positions = [{ top:0 }, {top: 0}, {top: 0}];
    var M = 2;
    var M1 = 1;
    var M2 = 0;
    */

    var positions = [{top: 0}, {top:0}];
    var M = 1;
    var M1 = 0;

    var predictScroll = function () { 
      //The Kinematic Equation
      // S = So + dS/dt*(t-to) + 1/2*d^2S/dt^2*(t-to)^2
      // S(m+n) = (1 + n + n^2)*S(m) - (n + 2*n^2)*S(m-1) + n^2*S(m-2)
      /*
       * 3rd Order was a little to volatile for longer term predictions
      var t2 = timeSteps*timeSteps;
      var prediction  = (1 + timeSteps + t2)*positions[M].top;
      prediction += (-(timeSteps + 2*t2))*positions[M1].top;
      prediction += t2*positions[M2].top;
      */

      // Ignore acceleration - 2nd order equation
      // S = So + dS/dt*(t-to)
      // S(m+n) = (1 + n)*S(m) - (n)*S(m-1)
      var prediction  = (1 + timeSteps)*positions[M].top;
      prediction += -timeSteps*positions[M1].top;

      return prediction;
    }; 

    var averageScrollPredict = function (cb, continuous) {
      var count = 0;
      var avgPrediction = 0;
      var avgPos = 0;
      var deltaN = Math.floor(spec.avgTime/spec.sampleTime);

      if(!continuous) {
        var pos = scroll.getPosition();
        //positions = [pos,pos,pos];
        positions = [pos,pos];
      }

      var average = setInterval(function () {
        positions.push(scroll.getPosition());
        positions.shift();
        var prediction;
        if(continuous) {
          //Continous gives a prediction for msFromNow after callback is called 
          //First result called after avgTime delay
          prediction = predictScroll(spec.msFromNow + spec.avgTime/2);
        } else {
          //Gives a prediction for (msFromNow) after the call was made
          //It takes avgTime to compute the result so it would be (msFromNow - avgTime)ms in the future
          prediction = predictScroll(spec.msFromNow - spec.avgTime/2);
        }

        avgPrediction += prediction/deltaN;
        avgPos += positions[M].top/deltaN;

        count++;
        if(count === deltaN) {
          cb(avgPrediction, avgPos);
          if(continuous) {
            avgPrediction = 0;
            avgPos = 0;
            count = 0;
          } else {
            clearInterval(average);
          }
        }
      }, spec.sampleTime);

      if(continuous) {
        return {
          stop: function () {
           clearInterval(average);
          }
        };
      } 
    };

    var update = function (pred) {
      var length = spec.list.get().length;

      /*
      var body = document.body;
      var html = document.documentElement;
      var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
      console.log(height);
      var avgHeight = height/length;
      */
      
      //TODO Calculate this from the items directives after they have loaded
      var avgHeight = 500;

      var needed = Math.round(pred/avgHeight) - length;
      if(needed > 0 && spec.list.areItemsAvailable()) {
        if(needed + length > max) {
          var limit = Math.min(needed, 50);
          max = length + limit;

          console.log('Have: ' + length + '\tLoading:' + limit + '\tWanted: ' + needed);
          spec.list.more(limit, function (items) {
            var done = function (item) {
              /*
              console.log('QueueAvg: ' + Math.round(PreloadQueue.stats.queueDelay) +
                          '\tLoadAvg: ' + Math.round(PreloadQueue.stats.loadDelay) +
                          '\tQueueLength: ' + PreloadQueue.stats.getLength());
                         */
                         
              spec.list.add(item);
            };

            var error = function (err) {
              console.log('Failed to preload the item!');
              console.log(err);
            };
            for(var i in items) {
              if(!items[i].preloaded) {
                items[i].preLoad = spec.list.preLoad.bind(this, items[i]);
                PreloadQueue.add(items[i]).then(done, error);
              }
            }
          }, true);
        }
      }
    };

    //var started = false;
    var max = 0;
    var predictor;

    var startMonitor = function () {
      var after = function (pred, pos) {
        update(pred, pos);
       // plotCallback(pred,pos);
      };

      predictor = averageScrollPredict(after, true);
    }; 

    var stopMonitor = function () {
      if(predictor) {
        predictor.stop();
        predictor = null;
      }
    };

     //Plotting data - Depends on angular-chart.js
    Platform.ready.then(function () {
//    Chart.defaults.global.animation = false;
      Chart.defaults.global.animationSteps = 1;
    });

    var plot = {
      data: [[],[],[]],
      series: ['Measured', 'Predicted', 'Max'],
      //data: [[],[]],
      //series: ['Measured', 'Predicted'],
      labels: []
    };

    var plotCallback = function () {};

    var  plotInit = function () {
      var MEASURE = 0;
      var PREDICT = 1;
      var MAX = 2;

      plot.data = [[],[],[]];
      plot.labels = [];

      var currTime = 0;

      var advance = Math.floor(spec.msFromNow/spec.avgTime);

      for(var i = 0; i < advance - 1; i++) {
        plot.data[PREDICT].push(0);
        plot.data[MAX].push(0);
        plot.labels.push(Math.round(i*spec.avgTime/10)/100); 
      }

      plotCallback = function (pred, pos) {
        //Plot update
        spec.$timeout(function () {
          plot.data[MEASURE].push(pos);
          plot.data[PREDICT].push(pred);
          currTime += spec.avgTime;
          plot.data[MAX].push(max);

          //plot.labels.push(Math.round(currTime/10)/100); 
          if(plot.data[MEASURE].length >= advance) {
            plot.labels.push(Math.round(currTime/10)/100); 
          }

          if(plot.data[MEASURE].length >= Math.max(advance*2, 20)) {
            plot.labels.shift(); 
            plot.data[MEASURE].shift(); 
            plot.data[PREDICT].shift(); 
            plot.data[MAX].shift();
          }
        });
      };
    };

    plotInit();

    // That is the object to be constructed
    // it has privlidged access to my, and spec
    that = {
      plot: plot,
      stop: stopMonitor,
      start: startMonitor
    };

    return that;
  };

  return preload;
}

app.factory('PreloadQueue', [
  '$q',
  PreloadQueueFactory
]);

app.factory('preload', [
  'Navigate',
  'Platform',
  'PreloadQueue',
  PreloadFactory
]);
