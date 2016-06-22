

angular.module('mock.services.activity', []).service('Activity', function() {
  return {
    numberOfAccesses: function() {
      return 0;
    },
    numberOfUniqueDays: function() {
      return 0;
    },
    activateFeedback: function() {},
    isFeedbackActive: function() {},
    registerView: function() {},
    registerArticleOpen: function() {},
  };
});
