
var importer = require('../sample-data/import');

module.exports = function (app) {

   console.log("Starting the import of sample data");

   importer(app, function(err) {
      if(err) {
         console.log("Import has failed - ", err);
      } else {
         console.log("Import was successful");
      }
   });
};
