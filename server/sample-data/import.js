var async = require('async');

var journalists = require('./journalist.json');
var articles = require('./article.json');
var subarticles = require('./subarticle.json');
var roles = require('./role.json');

module.exports = function (app, cb) {
   var Articles = app.models.Article;
   var Subarticles = app.models.Subarticle;
   var Journalists = app.models.Journalist;
   var Role = app.models.Role;
   var RoleMapping = app.models.RoleMapping;

   var ArticlesDB = app.datasources.Articles;
   var UserDB = app.datasources.Users;

   function importData(Model, data, cb) {

      console.log("Importing model - ", Model.modelName);

      Model.destroyAll( function(err) {
         if (err) {
            cb(err);
            return;
         }

         async.each(data, function (d, callback) {
            Model.create(d, callback);
         }, cb);
      });
   }

   async.series([
         function(cb) {
            console.log("Updating databases");
            ArticlesDB.autoupdate(cb);
            UserDB.autoupdate(cb);
         },

         importData.bind(null, Journalists, journalists),
         importData.bind(null, Articles, articles),
         importData.bind(null, Subarticles, subarticles)

      ], function(err) {
            cb(err);
      }
   );

   Role.create({
      name: 'admin'
   }, function(err, role) {
      if (err) {
         cb(err);
         return;
      }

      console.log('Created role:', role);

      //make zane an admin
      role.principals.create({
         principalType: RoleMapping.USER,
         principalId: 1
      }, function(err,principal) {
         if (err) {
            cb(err);
            return;
         }
         console.log('Created principal - '+ principal + ' for admin');
      });
   });
};
