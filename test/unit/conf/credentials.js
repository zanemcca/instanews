
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
        key: 'mongoEast',
        value : {
          'username' : 'owner',
          'url': '@candidate.54.mongolayer.com:10021,candidate.53.mongolayer.com:10272/',
          'replicaSet' : 'set-560ef40b82a2b3b5a5001386',
          'password' : 'couchesareabit2fly4me'
        }
      }];
      testKeys(tests);
    }
  });
};
