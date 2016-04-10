
var SignupPage = function () {
  this.get = function () {
    browser.get('http://localhost:3000/#/app/login');
  }

  this.setUsername = function(name) {
    element(by.model('newUser.username')).sendKeys(name);
  }

  this.setEmail = function(email) {
    element(by.model('newUser.email')).sendKeys(email);
  }

  this.setPassword = function(pass) {
    element(by.model('newUser.password')).sendKeys(pass);
  }

  this.submit = function() {
    var signup = element(by.buttonText('Sign Up'));
    signup.click();
  }

  this.openLogin = function () {
    element(by.partialButtonText('Already have')).click();
  }
};

var FeedPage = function() {
  this.get = function () {
    browser.executeScript(function() {
      window.cordova = {};
    }).then(function() {
      browser.get('http://localhost:3000/#/app/feed');
    });
  };

  this.post = function() {
    element(by.css('[ng-click="post()"]')).click();
  };
};

function getRandomUsername() {
  var parts = ['ay', 'ba', 'la', 'er', 'aw' ,'ea', 'zy', 'za', 'be', 'go' ,'fr', 'oll', 'pu', 'ch', 'st','bo'];
  var name = parts[Math.round(Math.random()*(parts.length - 1))]
  name += parts[Math.round(Math.random()*(parts.length - 1))]
  name += parts[Math.round(Math.random()*(parts.length - 1))]

  return name;
}

describe('Sign Up', function() {
  it('should signup a new user and then navigate to the feed', function(done) {
    var username = getRandomUsername();

    var page = new FeedPage();
    page.get();
    page.post();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/app/login');
    //page.init();

    var page = new SignupPage();
    page.setUsername(username);
    page.setEmail(username + '@instanews.com');
    page.setPassword('goodenough');
    page.submit();

    //TODO Catch email sent and grab confirmation code

    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/app/feed');
    done();
  });
});
