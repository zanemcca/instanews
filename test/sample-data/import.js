var async = require('async');

var journalists = require('./journalist.json');
var comments = require('./comment.json');
var articles = require('./article.json');
var subarticles = require('./subarticle.json');
//var roles = require('./role.json');

module.exports = function (app, cb) {

   var Articles = app.models.Article;
   var Subarticles = app.models.Subarticle;
   var Journalists = app.models.Journalist;
   var Comments    = app.models.Comment;
   var Roles =       app.models.Role;
   var RoleMapping = app.models.RoleMapping;
   var AccessToken = app.models.AccessToken;

   var UpVotes = app.models.upVote;
   var DownVotes = app.models.downVote;

   var ArticlesDB = app.datasources.Articles;
   var UserDB = app.datasources.Users;
   var db = app.datasources.db;

   /*
   var st = app.datasources.photos;
   var container = st.createModel('container');
   app.model(container);
   */

   // This function imports all members of the data array into the given Model
   function importData(Model, data, callb) {

      console.log('Importing model - ', Model.modelName);

      //Clear all existing things in the model
      Model.destroyAll( function(err) {
         if (err) return callb(err);

         if (data.length > 0) {
            console.log('Populating...');
            //Create a model instance for each member of the array
            async.each(data, function (d, callback) {
               Model.create(d, callback);
            }, function(err, res) {
               if(err) return callb(err);

               callb(null, Model.modelName);
            });
         }
         else {
            callb(null);
         }
      });
   }

   function importArticles(cb) {

      function randomLat() {
         max = 46;
         min = 45;
         return Math.random()*(max - min) + min;
      };

      function randomLng() {
         max = -65.5;
         min = -67;
         return Math.random()*(max - min) + min;
      };

      function randomId() {
         var id = Math.floor(Math.random()*Math.pow(2,32));
         console.log(id);
         return id;
      };

      var limit = 200;
      for( var i = 0; i < limit ; i++ ) {
         Articles.create({
            title: i,
            myId: randomId(),
            location: {
               lat: randomLat(),
               lng: randomLng()
            },
            isPrivate: false
         }, function(err, res) {
            console.log(res);
         });
      }
      cb(null);

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
                     principalId: journalists[0].username
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
      importData.bind(null,UpVotes, []),
      importData.bind(null,DownVotes, []),
      importData.bind(null,Comments, comments),
      importData.bind(null,Subarticles, subarticles),
      createAdmin.bind(null),
      importArticles.bind(null),
      updateDB.bind(null)
   ], function(err,res) {
         if (err) {
            console.log('\nFailed to import the data!\n', err);
         }
         else console.log('Completed the sample data importing');

         cb(err);
   });
};
