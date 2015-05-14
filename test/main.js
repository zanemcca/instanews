

var common = require('./common.js');
var app = common.app;

var importer = require('./sample-data/import');

describe('Top', function() {

   this.timeout(30000);

   before( function(done) {
      importer(app, done);
   });

   describe('', function() {
      var test = require('./permissions/test');
      test.run();
   });

});

