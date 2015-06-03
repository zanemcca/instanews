
var async = require('async');
var expect = require('chai').expect;

var common =  require('../common');
var api = common.api;
var app = common.app;
var Roles =       app.models.Role;
var RoleMapping = app.models.RoleMapping;
var AccessToken = app.models.AccessToken;
var Journalists = app.models.Journalist;
var Installations = app.models.Installation;
var Subarticles =  app.models.Subarticle;

var users = require('./users.json');
//Import the genericModels to be used by the testcases
var genericModels = require('./genericModels');
var articles = require('./articles');
var apps = require('./apps');
var comments = require('./comments');
var upVotes = require('./upVotes');
var downVotes = require('./downVotes');
var subarticles = require('./subarticles');
var installations = require('./installations');
var journalists = require('./journalists');
var storages = require('./storages');

require('it-each')({ testPerIteration: true });
//require('it-each')();

var dump = function(err, res) {
   /*
   if (err) {
      console.log(err);
   }
   else if(res && res.body && res.body.error) {
      console.log('\nName: ' + res.body.error.name + '\tStatus: ' + res.body.error.status);
      console.log('Message: ' + res.body.error.message);
      console.log('\n' + res.body.error.stack + '\n');
   }
   /*
   else {
      console.log(res.body);
   }
   */
};

var removeModel = function(model, models) {
   if( models ) {
      for(var i = 0; i < models.length; i++) {
         if(models[i].type === model.type) {
            models.splice(i,1);
            return true;
         }
      }
   }
   //console.log('No model found for ' + type);
   return false;
};

var findModel = function(type, models) {
   if( models ) {
      for(var i = 0; i < models.length; i++) {
         if(models[i].type === type) {
            return models[i];
         }
      }
   }
   //console.log('No model found for ' + type);
   return;
};

/*
 * This function will purge the database of anything that could cause problems for the testcases
 */
var purgeDB = function(cb) {
   Installations.destroyAll(function(err) {
      cb(err);
   });
};

var token = {
   id: ''
};
var diffUserToken = {
   id: ''
};

var user = {};

var models = [];

var testEndpoint = function(oldEndpoint, test, role, next) {

   describe('node', function() {

      var type;
      var models = [];

      //Setup the endpoint for printing and later setup
      var endpoint = oldEndpoint;
      if( test.endpoint) {
         endpoint += '/' + test.endpoint;
      }
      else {
         //Id will be replaced later when models are created
         endpoint += '/{id}';
      }

      /*
       * This function runs a single unit test using the
       * information that is prepared in beforeEach
       */
      var unitTest  = function(res,next) {

         //console.log(res.request + ' ' + endpoint);
         //Set up the request based on the request type given
         var func;
         if(res.request === 'post') {
            //Try to find the model in the database
            var mod = findModel(type,models);
            if(!mod) {
               //If the model is not in the database try the tests file
               mod = findModel(type, test.models);
               if(!mod) {
                  //If the model is not in the testcase then use a generic one
                  mod = findModel(type, genericModels);
               }
            }
            /*
            if(!mod) {
               console.log('No model was found for the POST operation');
               console.log('Please consider updating the tests file to include this model');
            }
            */

            func = api.post(endpoint).send(mod);
         }
         else if(res.request === 'get') {
            func = api.get(endpoint);
         }
         else if(res.request === 'put') {
            //Try to find the model in the database
            func = api.put(endpoint).send(findModel(type,models));
         }
         else if(res.request === 'delete') {
            func = api.delete(endpoint);
         }
         else if( res.request === 'head') {
            func = api.head(endpoint);
         }
         else {
            console.log('Error: Unknown request type: ' + res.request);
         }

         //Figure out which result we should be looking at based on
         //the role our current user has
         var result = res.all;
         if(!result) {
            if( role === 'admin') {
               result = res.admin;
            }
            else if( role === 'user') {
               result = res.user;
            }
            else if( role === 'guest') {
               result = res.guest;
            }
         }

         //Run the actual test
         func.set('Authorization', token.id)
         .expect(result)
         .end( function(err, ret) {
            if(ret && (res.request === 'put' || res.request === 'post')) {
               var body = ret.body;
               body.type = type;
               //console.log(JSON.stringify(ret));
               if(!body.error) {
                  models.push(body);
               }
            }

            /*
             * TODO add assertions
             */

            dump(err, ret);
            next(err, ret);
         });
      };


      /*
       * This function will add the given model based on the given endpoint
       * from the diffUser account
       */
      var diffUserAddModel = function(model, endpoint, cb) {

         var handleResult =  function(err, res) {

            dump(err, res);
            //Save the model locally
            var body = res.body;
            if(!body) {
               body = res;
            }
            if(body.error) {
               //console.log(body.error);
            }
            else {
               body.type = type;
               models.push(body);
            }

            //console.log('Created a model: ' + JSON.stringify(body));
            cb(err, res);
         };

         if( model.type === 'subarticles') {
            model.username = users.diffUser.username;
            Subarticles.create(model, handleResult);
         }
         else {
            api.post(endpoint)
            .send(model)
            .set('Authorization', diffUserToken.id)
            .expect(200)
            .end( handleResult);
         }
      };

      /*
       * This function will clear all models that the current test has created
       */
      var clearEndpoint =  function(endpoint, ends, count, callback, diffUser) {
         if(count ===  ends.length) {
            callback();
         }
         else{
            endpoint += '/' + ends[count];

            var tempModel = findModel(ends[count], models);

            if(tempModel) {

               var id;
               if(role === 'guest' || diffUser) {
                  id = diffUserToken.id;
               }
               else {
                  id = token.id;
               }

               //console.log('Deleting a model: ' + JSON.stringify(tempModel));
               if( tempModel.type === 'journalists') {
                  Journalists.deleteById(tempModel.username, function(err, res) {
                     dump(err, res);
                     removeModel(tempModel, models);
                     clearEndpoint(endpoint, ends, count + 1, callback);
                  });
               }
               else {
                  api.delete(endpoint)
                  .send(tempModel)
                  .set('Authorization', id)
                  .end( function(err, res) {

                     dump(err, res);
                     removeModel(tempModel, models);
                     clearEndpoint(endpoint, ends, count +1, callback);
                  });
               }
            }
            else {
               clearEndpoint(endpoint, ends, count +1, callback);
            }
         }
      };

      /*
       * This function is meant to be recursively called before the
       * execution of each unittest.
       * It will create any models that are needed and it will prepare
       * the endpoint to be used by the unittest.
       */
      var prepEndpoint = function(ends, count, callback, diffUser) {
         //Ending condition
         var tempModel = {};
         if(count === ends.length) {
            callback();
         }
         else if( ends[count] === '{id}') {
            tempModel = findModel(ends[count-1], models);

            if( tempModel ) {
               if( tempModel.id ) {
                  endpoint += '/' + tempModel.id;
               }
               else if( tempModel.username ) {
                  endpoint += '/' + tempModel.username;
               }
               else {
                  endpoint += '/{id}';
                  console.log('Warning: Model was found but has an invalid id');
               }

               prepEndpoint(ends,count + 1,callback);
            }
            else {
               //console.log('Warning: A model should be available for ' + ends[count-1]);
               endpoint += '/{id}';
               prepEndpoint(ends,count + 1,callback);
            }
         }
         else {
            type = ends[count];
            endpoint += '/' + type;
            //Check for a model instance designed specifically for this testcase
            tempModel = findModel(ends[count], test.models);
            if( !tempModel) {
               //Since a model was not given in the test it is assumed
               //that a generic model will suffice
               tempModel = findModel(ends[count], genericModels);
            }

            if( tempModel ) {

               if( !tempModel.noPreCreate ) {

                  //Check if the test is requesting for the
                  // models used to be created by a different
                  // user than the one logged in. This is always
                  // the case with a guest
                  if(diffUser || role === 'guest') {
                     diffUserAddModel(tempModel, endpoint, function() {
                        prepEndpoint(ends,count + 1,callback, true);
                     });
                  }
                  else{

                     var handleResult =  function(err, res) {
                        //Save the model locally
                        var body = res.body;
                        if(!body) {
                           body = res;
                        }
                        if(body.error) {
                           //console.log(body.error);
                        }
                        else {
                           body.type = type;
                           models.push(body);
                        }

                        //console.log('Created a model: ' + JSON.stringify(body));
                        dump(err, res);
                        prepEndpoint(ends,count + 1,callback);
                     };

                     if( tempModel.type === 'subarticles') {
                        tempModel.username = user.username;
                        Subarticles.create(tempModel, handleResult);
                     }
                     else {
                        api.post(endpoint)
                        .send(tempModel)
                        .set('Authorization', token.id)
                        .end( handleResult);
                     }
                     //Create a model for every time {id} shows up
                     //console.log('Creating a model: ' + JSON.stringify(tempModel));
                     //console.log('At ' + endpoint);
                  }
               }
               else{
                  prepEndpoint(ends, count + 1, callback);
               }
            }
            else {
               //console.log('Error: A model should be available for ' + ends[count]);
               prepEndpoint(ends,count + 1,callback, diffUser);
            }
         }
      };

      //Run the tests on the current endpoint
      describe('testing my model @ ' + endpoint, function() {

         beforeEach( function(done) {
            //Recursively prepare the endpoint and
            //create any models that will be needed
            models = [];
            var ends = endpoint.split('/');
            endpoint = ends[0];
            purgeDB( function(err) {
               if(err) return done(err);
               prepEndpoint(ends,1,done);
            });
         });

         afterEach( function(done) {
            var ends = endpoint.split('/');
            clearEndpoint(ends[0], ends,1,done);
         });

         if( test.myResults) {
            it.each(test.myResults,
            role + ' %s ' + endpoint,
            ['request'],
            unitTest);
         }
      });

      //Run the tests on the current endpoint
      describe('testing a different users model @ ' + endpoint, function() {

         beforeEach( function(done) {
            //Recursively prepare the endpoint and
            //create any models that will be needed
            models = [];
            var ends = endpoint.split('/');
            endpoint = ends[0];
            purgeDB( function(err) {
               if(err) return done(err);
               prepEndpoint(ends,1,done, true);
            });
         });

         afterEach( function(done) {
            var ends = endpoint.split('/');
            clearEndpoint(ends[0], ends,1,done, true);
         });

         if( test.theirResults) {
            it.each(test.theirResults,
            role + ' %s ' + endpoint,
            ['request'],
            unitTest);
         }
      });

      describe('related', function() {
         if( test.children ) {
            async.each(test.children,
               function(child, callback) {
                  testEndpoint(endpoint, child, role, callback);
               },
               function(err, res) {
                  dump(err,res);
               });
         }
      });

      if( next) {
         next();
      }

   });
};


var testModel = function(tests) {

   describe(tests.endpoint, function() {

      //This function creates the admin role and inserts the admin user
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
                     //console.log('Created role:', role.name);

                     role.principals.create({
                        principalType: RoleMapping.USER,
                        principalId: users.admin.username
                     }, function(err, principal) {
                        if (err) return callback(err);

                        //console.log('Created principal:', principal.principalType);
                        callback();
                     });
                  });
               });
            });
         });
      }

      //Create the users that will be required in the testcases
      before( function(done) {
         //Clear all existing things in the model
         Journalists.destroyAll( function(err) {
            if (err) return done(err);

            Journalists.create(users.admin, function(err,res){
               if (err) return done(err);
               createAdmin( function(err, res) {
                  if(err) {
                     console.log('Failed to create the admin role: ' + err);
                     done(err);
                  }
                  else {
                     Journalists.create(users.user, function(err,res) {
                        if(err) return done(err);
                        Journalists.create(users.diffUser, function(err,res) {
                           if(err) return done(err);

                           var credentials = users.diffUser;
                           //Login as the diffUser and save the credentials
                           api.post('/api/journalists/login')
                           .send(credentials)
                           .expect(200)
                           .end(function(err, res) {
                              if (err) return done(err);

                              diffUserToken = res.body;
                              expect(diffUserToken.userId).to.equal(credentials.username);

                              //console.log('Before Setup was successful');
                              done(err,res);
                           });
                        });
                     });
                  }
               });
            });
         });
      });

      after( function (done) {
         //Logout
         api.post('/api/journalists/logout')
         .set('Authorization', diffUserToken.id)
         .expect(204)
         .end( function(err,res) {
            dump(err, res);
            done(err,res);
         });
      });

      //Run the tests as an admin
      describe('admin', function() {
         var role = 'admin';
         var credentials = users.admin;
         user = credentials;

         //Login before the tests are run
         before( function(done) {
            api.post('/api/journalists/login')
            .send(credentials)
            .expect(200)
            .end(function(err, res) {
               if (err) return done(err);

               token = res.body;
               expect(token.userId).to.equal(credentials.username);

               done();
            });
         });

         //Logout after the tests are finished
         after( function(done) {
            api.post('/api/journalists/logout')
            .set('Authorization', token.id)
            .expect(204)
            .end( function(err,res) {
               done(err);
            });
         });

         describe('running', function(done) {
            testEndpoint('/api', tests, role, done);
         });
      });

      //Run the tests as a user
      describe('user', function() {
         var role = 'user';
         var credentials = users.user;
         user = credentials;

         //Login before the tests are run
         before( function(done) {
            api.post('/api/journalists/login')
            .send(credentials)
            .expect(200)
            .end(function(err, res) {
               if (err) return done(err);

               token = res.body;
               expect(token.userId).to.equal(credentials.username);

               done();
            });
         });

         //Logout after the tests are finished
         after( function(done) {
            api.post('/api/journalists/logout')
            .set('Authorization', token.id)
            .expect(204)
            .end( function(err,res) {
               done(err);
            });
         });

         describe('running', function(done) {
            testEndpoint('/api', tests, role, done);
         });
      });

      //Run the tests as a guest
      describe('guest', function(done) {
         var role = 'guest';
         token.id = '';

         testEndpoint('/api', tests, role, done);
      });
   });
};

exports.run = function() {
   //TODO Deal with storages as a special case
   //testModel(storages);

   testModel(apps);
   testModel(articles);
   testModel(comments);
   testModel(downVotes);
   testModel(upVotes);
   testModel(installations);
   testModel(journalists);
   testModel(subarticles);
};

