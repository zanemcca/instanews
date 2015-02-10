var async = require('async');

var journalists = require('./journalist.json');
var articles = require('./article.json');
var subarticles = require('./subarticle.json');
var roles = require('./role.json');

module.exports = function (app, cb) {
   var Articles = app.models.Article;
   var Subarticles = app.models.Subarticle;
   var Journalists = app.models.Journalist;
   var Roles =       app.models.Role;
   var RoleMapping = app.models.RoleMapping;

   var ArticlesDB = app.datasources.Articles;
   var UserDB = app.datasources.Users;

   function dbErr(err) {
      if(err) {
         console.log('DB Error - ',err);
      }
   }

   // This function imports all members of the data array into the given Model
   function importData(Model, data, errCB) {

      console.log('Importing model - ', Model.modelName);

      //Clear all existing things in the model
      Model.destroyAll( function(err) {
         if (err) {
            errCB(err);
         }

         //Create a model instance for each member of the array
         async.each(data, function (d, callback) {
            Model.create(d, callback);
         }, errCB);
      });
   }

   console.log('Starting the import of sample data');
   async.series([
      importData.bind(null,Journalists, journalists),
      importData.bind(null,Articles, articles),
      importData.bind(null,Subarticles, subarticles),
      importData.bind(null,Roles, roles),
      function(callback) {
         ArticlesDB.autoupdate(dbErr);
         UserDB.autoupdate(dbErr);
         callback();
      }
   ], function(err,res) {
         console.log('Completed the sample data importing');
         cb(err);
   });
};
