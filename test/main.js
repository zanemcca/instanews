
/*jslint maxlen: 130 */

var common = require('./common.js');
var app = common.app;
var importTest = common.importTest;

var importer = require('./sample-data/import');

describe('Top', function() {

   this.timeout(10000);

   before( function(done) {
      importer(app, done);
   });

   describe('REST', function() {
      importTest("Guest",'./REST/guest');
      importTest("Admin",'./REST/admin');
   });

});

