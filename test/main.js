

var common = require('./common.js');
var app = common.app;
var importTest = common.importTest;

var importer = require('./sample-data/import');

describe('Top', function() {

   this.timeout(10000);

   before( function(done) {
      importer(app, done);
   });

   describe('Permissions', function() {
      importTest("Admin",'./permissions/admin');
      importTest("Guest",'./permissions/guest');
      importTest("User",'./permissions/user');
   });

});

