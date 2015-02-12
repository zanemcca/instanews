var async = require('async');

var journalists = require('./journalist.json');
var articles = require('./article.json');
var subarticles = require('./subarticle.json');
//var roles = require('./role.json');

module.exports = function (app, cb) {

   var Articles = app.models.Article;
   var Subarticles = app.models.Subarticle;
   var Journalists = app.models.Journalist;
   var Roles =       app.models.Role;
   var RoleMapping = app.models.RoleMapping;
   var AccessToken = app.models.AccessToken;

   var ArticlesDB = app.datasources.Articles;
   var UserDB = app.datasources.Users;
   var db = app.datasources.db;

   // This function imports all members of the data array into the given Model
   function importData(Model, data, callb) {

      console.log('Importing model - ', Model.modelName);

      //Clear all existing things in the model
      Model.destroyAll( function(err) {
         if (err) return callb(err);

         //Create a model instance for each member of the array
         async.each(data, function (d, callback) {
            Model.create(d, callback);
         }, function(err, res) {
            if(err) return callb(err);

            callb(null, Model.modelName);
         });
      });
   }

   function createAdmin(callback) {
      AccessToken.destroyAll( function(err) {
         if (err) return callback(err);

         RoleMapping.destroyAll( function(err) {
            if (err) return callback(err);

            Roles.destroyAll( function(err) {
               if (err) return callback(err);

               Roles.create({
                  name: 'admin'
               }, function(err, role) {
                  if (err) return callback(err);
                  console.log('Created role:', role.name);

                  role.principals.create({
                     principalType: RoleMapping.USER,
                     principalId: journalists[0].journalistId
                  }, function(err, principal) {
                     if (err) return callback(err);

                     console.log('Created principal:', principal.principalType);
                     callback();
                  });
               });
            });
         });
      });
   }

   function updateDB(callback) {
      ArticlesDB.autoupdate(
            UserDB.autoupdate(
               db.autoupdate( function(err, res) {
                  if (err) console.log('db Error');
                  callback(err, res);
               })));
   }

   console.log('Starting the import of sample data');

   async.series([
      importData.bind(null,Journalists, journalists),
      importData.bind(null,Articles, articles),
      importData.bind(null,Subarticles, subarticles),
      createAdmin.bind(null),
      updateDB.bind(null)
   ], function(err,res) {
         if (err) {
            console.log('\nFailed to import the data!\n', err);
         }
         else console.log('Completed the sample data importing');

         cb(err);
   });
};
