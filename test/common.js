
var should = require('chai').should(),
    supertest = require('supertest'),
    app = require('../server/server'),
    api = supertest(app),
    assert = require('assert');

function importTest(name, path) {
   describe(name, function () {
      require(path);
   });
}

var dump = function(err, res) {
   if (err) {
      console.log('\nName: ' + res.body.error.name + '\tStatus: ' + res.body.error.status);
      console.log('Message: ' + res.body.error.message);
      console.log('\n' + res.body.error.stack + '\n');
   }
};

exports.assert = assert;
exports.app = app;
exports.api = api;
exports.importTest = importTest;
exports.dump = dump;
