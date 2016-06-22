
'use strict';
var app = angular.module('instanews.service.activity', []);

app.factory('Activity', [
  'LocalStorage',
  'Platform',
  function(
    LocalStorage,
    Platform
  ) {
    var activity = {
      latestDays: [],
      accesses: 0
    };

    var views = 0;
    var articleOpens = 0;
    var cacheLimit = 25;
    var feedbackActive = false;
    var date = (new Date()).toDateString();

    Platform.ready.then(function() {
      LocalStorage.secureRead('activity', function(err, results) {
        if(err) {
          console.log(err);
        }

        if(results) {
          activity = results;
        }

        if(!activity.latestDays.length || activity.latestDays[activity.latestDays.length - 1] !== date) { 
          activity.latestDays.push(date);
          while(activity.latestDays.length > cacheLimit) {
            activity.latestDays.shift();
          }
        }
        activity.accesses++;

        LocalStorage.secureWrite('activity', activity);
      });
    });

    var numberOfAccesses = function() {
      return activity.accesses;
    };

    var numberOfUniqueDays = function() {
      return activity.latestDays.length;
    };

    var hideFeedback = function() {
      activity.feedbackHidden = date;
      LocalStorage.secureWrite('activity', activity);
    };

    var isFeedbackActive = function() {
      return feedbackActive && !activity.feedbackHidden;
    };

    var activateFeedback = function() {
      feedbackActive = true;
    };

    var registerView = function() {
      views++;
      if(views === 50) {
        activateFeedback();
      }
    }; 

    var registerArticleOpen = function() {
      articleOpens++;
      if(articleOpens === 2) {
        activateFeedback();
      }
    };

    return {
      registerView: registerView,
      registerArticleOpen: registerArticleOpen,
      isFeedbackActive: isFeedbackActive,
      activateFeedback: activateFeedback,
      hideFeedback: hideFeedback,
      numberOfAccesses: numberOfAccesses,
      numberOfUniqueDays: numberOfUniqueDays
    };
  }
]);
