'use strict';

var app = angular.module('instanews.directive.feedback', []);

app.directive('inFeedback', [
  'Activity',
  'Device',
  'Dialog',
  'Feedback',
  'Platform',
  'TextInput',
  function (
    Activity,
    Device,
    Dialog,
    Feedback,
    Platform,
    TextInput
  ) {
    return {
      restrict: 'E',
      scope: {
      },
      controller: function(
        $scope
      ) {

        var questionId;
        $scope.text = {};

        var setupQuestion = function(qId) {
          switch(qId) {
            case 'original':
              $scope.text.agree = 'Yes!';
              $scope.text.disagree = 'Not Really';
              $scope.text.question = 'Enjoying instanews?';
              questionId = 'original';
              break;
            case 'openApp':
              $scope.text.agree = 'Ok, sure';
              $scope.text.disagree = 'No Thanks';
              $scope.text.question = 'How about trying out the instanews app, then?';
              questionId = 'openApp';
              break;
            case 'rate':
              if(Device.isIOS()) {
                $scope.text.question = 'How about a rating on the App Store, then?';
              } else if(Device.isAndroid()) {
                $scope.text.question = 'How about a rating on the Google Play Store, then?';
              } else {
                console.log('Invalid device!');
                $scope.text.question = 'How about a giving us a rating then?';
              }

              $scope.text.agree = 'Ok, sure';
              $scope.text.disagree = 'No Thanks';
              questionId = 'rate';
              break;
            case 'feedback':
              $scope.text.question = 'Would you mind giving us some feedback?';
              $scope.text.agree = 'Ok, sure';
              $scope.text.disagree = 'No Thanks';
              questionId = 'feedback';
              break;
            default:
              console.log('Unknown question asked!');
          }
        };

        var openAppStore = function () {
          //jshint undef:false
          var appId;
          if(Device.isIOS()) {
            appId = '1076727754';
          } else if(Device.isAndroid()) {
            appId = 'com.instanews.android';
          } else {
            console.log('Unknown device type! Cannot open the app store');
            return;
          }

          LaunchReview.launch(appId, function() {
            console.log('Successfully launched app store');
          });
        };

        var getFeedback = function () {
          var textInput = TextInput.get('modal');
          textInput.placeholder = 'What do you think of instanews?';

          textInput.open(function (newText) {
            Feedback.submit({
              content: newText
            }, function() {
              Dialog.toast('Thanks for your support');
              console.log('Successfully submitted feedback');
              console.log(newText);
            }, function(err) {
              Dialog.alert('There was an error submitting your feedback', 'Please try again later');
              console.log(err);
            });
          }, function () {
            console.log('Feedback cancelled');
          });
        };

        var agree = function() {
          Platform.analytics.trackEvent('feedback', questionId, 'agree');
          switch(questionId) {
            case 'original':
              if(Device.isBrowser()) {
                setupOpenApp();
              } else {
                setupQuestion('rate');
              }
              break;
            case 'rate':
              openAppStore();
              reset();
              break;
            case 'feedback':
              getFeedback();
              reset();
              break;
            default:
              console.log('Unknown question asked!');
          }
        };

        var reset = function() {
          if(Device.isBrowser()) {
            Platform.branch.branch.removeListener('didDeepviewCTA', reset);
            $scope.agree = agree;
          }
          setupQuestion('original');
          Activity.hideFeedback();
        };

        var setupOpenApp = function() {
          var data = {};
          Platform.branch.branch.addListener('didDeepviewCTA', reset);

          Platform.analytics.trackEvent('ViewInApp', 'start', 'Mobile');
          Platform.branch.createDeepview(data, function(err) {
            if(err) {
              console.log(err);
              Platform.analytics.trackEvent('ViewInApp', 'error', 'Mobile');
              Dialog.alert('There was an unexpected error', 'Sorry for the inconvenience!');
              reset();
            } else {
              Platform.analytics.trackEvent('ViewInApp', 'doesNotHaveApp', 'Mobile');
              $scope.agree = Platform.branch.branch.deepviewCta.bind(Platform.branch.branch);
              setupQuestion('openApp');
            }
          });
        };

        $scope.isShown = function() {
          if(Activity.isFeedbackActive()) {                   //Not hidden by the user
            if(Device.isIOS() || Device.isAndroid()) {        //Mobile only 
              if(!Device.isBrowser() ||                       //Within the app 
                 (!Platform.branch.hasApp &&                  //In browser and do not have the app and within a valid country 
                  (!window.geo.country || Platform.isValidCountry(window.geo.country)))) {
                // The user must hav accessed the app over three unique days and have at least five accesses total
                if(Activity.numberOfUniqueDays() >= 3 && Activity.numberOfAccesses() >= 5) {
                  return true;
                }
              }
            }
          }
          return false;
        };

        $scope.agree = agree;

        $scope.disagree = function() {
          Platform.analytics.trackEvent('feedback', questionId, 'disagree');
          switch(questionId) {
            case 'original':
              setupQuestion('feedback');
              break;
            default:
              reset();
              break;
          }
        };

        setupQuestion('original');
      },
      templateUrl: 'templates/directives/feedback.html'
    };
  }
]);
