
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');

var Credentials;
function start() {
  Credentials = common.req('conf/credentials');
}

exports.run = function () {
  describe('Credentials', function () {
    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    beforeEach(function () {
      start();
    });

    var testKeys = function (tests) {
      tests.forEach(function (test) {
        it('get(' + test.key + ')' , function () {
          expect(Credentials.get(test.key)).to.deep.equal(test.value);
        });
      });
    };

    var tests = [];

    if(process.env.NODE_ENV === 'development') {
      tests = [{
        key: 'mongoEast',
        value : {
          url: 'localhost:27017/'
        }
      }];
      testKeys(tests);
    } else if(process.env.NODE_ENV === 'staging') {
      tests = [{
        key: 'mongo',
        value : {
          'username' : 'owner',
          'url': '@aws-us-east-1-portal.7.dblayer.com:10698,aws-us-east-1-portal.10.dblayer.com:10304/',
          'ssl': true,
          'password' : 'couchesareabit2fly4me'
        }
      }];
      testKeys(tests);
    }
  });
};
