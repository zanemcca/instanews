
var async = require('async');
var api = require('../common').api;
var expect = require('chai').expect;

var articles = require('./articles.json');
var apps = require('./apps');

require('it-each')({ testPerIteration: true });
//require('it-each')();

var dump = function(err, res) {
   if (err) {
      //console.log(err);

      if(res && res.body && res.body.error) {
         console.log('\nName: ' + res.body.error.name + '\tStatus: ' + res.body.error.status);
         console.log('Message: ' + res.body.error.message);
         console.log('\n' + res.body.error.stack + '\n');
      }
      /*
      else {
         console.log(res.body);
      }
      */
   }
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


var token, tests = [];
var models = [];

var testEndpoint = function(oldEndpoint, test, role, next) {

   describe('node', function() {
      var type;
      //Setup the endpoint for printing
      var endpoint = oldEndpoint;
      if( test.endpoint) {
         endpoint += '/' + test.endpoint;
      }
      else {
         endpoint += '/{id}';
      }

      before( function(done) {
         //Setup the endpoint for calling
         if( test.endpoint ) {
            type = test.endpoint;
            endpoint = oldEndpoint + '/' + type;
         }
         else {
            var arr = oldEndpoint.split('/');
            type = arr[arr.length -1];

            var model = findModel(type, models);
            if( model && model.id) {
               endpoint = oldEndpoint + '/' + model.id;
            }
            /*
            else {
               console.log('Did not find ' + type + '. Trying ' + arr[arr.length -2]);
               type = arr[arr.length -2];

               var model = findModel(type, models);
               if( model && model.id) {
                  endpoint = oldEndpoint + '/' + model.id;
               }
            }
            */
         }
         done();
      });

      //Run the tests on the current endpoint
      describe(endpoint, function() {
         it.each(test.results,
         role + ' %s ' + endpoint,
         ['request'],
         function(res,next) {

            //console.log(res.request + ' ' + endpoint);
            //Set up the request based on the request type given
            var func;
            if(res.request === 'post') {
               //Try to find the model in the database
               var mod = findModel(type,models);
               if(!mod) {
                  //If the model is not in the database try the tests file
                  mod = findModel(type, tests.models);
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
                  models.push(body);
               }
               dump(err, ret);
               next(err, ret);
            });

         });
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

      after( function() {
         if ( next ) {
            next();
         }
      });

   });
};


var testModel = function(toTest) {
   //TODO get rid of the global variable
   tests = toTest;

   describe(tests.endpoint, function() {

      //Run the tests as an admin
      describe('admin', function() {
         var role = 'admin';
         var credentials = {
            email: 'zane@instanews.com',
            password: 'password'
         };

         //Login before the tests are run
         before( function(done) {
            api.post('/api/journalists/login')
            .send(credentials)
            .expect(200)
            .end(function(err, res) {
               if (err) return done(err);

               token = res.body;
               expect(token.userId).to.equal('zane');

               var endpoint = '/api/' + tests.endpoint;

               var inst = findModel(tests.endpoint, tests.models);
               if( inst) {
                  api.post(endpoint)
                  .send(inst)
                  .set('Authorization', token.id)
                  .expect(200)
                  .end( function(err, res) {
                     var body = res.body;
                     body.type = inst.type;
                     models = [body];
                     dump(err, res);
                     done(err,res);
                  });
               }
               else {
                  console.log('No model found for pre test creation');
                  done();
               }
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
         var credentials = {
            email: 'bob@instanews.com',
            password: 'password'
         };

         //Login before the tests are run
         before( function(done) {
            api.post('/api/journalists/login')
            .send(credentials)
            .expect(200)
            .end(function(err, res) {
               if (err) return done(err);

               token = res.body;
               expect(token.userId).to.equal('bob');

               var inst = findModel(tests.endpoint, tests.models);
               var endpoint = '/api/' + tests.endpoint;
               if( inst) {
                  api.post(endpoint)
                  .send(inst)
                  .set('Authorization', token.id)
                  .expect(200)
                  .end( function(err, res) {
                     var body = res.body;
                     body.type = inst.type;
                     models = [body];
                     dump(err, res);
                     done(err,res);
                  });
               }
               else {
                  console.log('No model found for pre test creation');
                  done();
               }
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
      describe('guest', function() {
         var role = 'guest';
         var credentials = {
            email: 'bob@instanews.com',
            password: 'password'
         };

         before( function(done) {
            //Login before the tests are run
            api.post('/api/journalists/login')
            .send(credentials)
            .expect(200)
            .end(function(err, res) {
               if (err) return done(err);

               token = res.body;
               expect(token.userId).to.equal('bob');

               //create a model item
               var inst = findModel(tests.endpoint, tests.models);
               var endpoint = '/api/' + tests.endpoint;
               if( inst) {
                  api.post(endpoint)
                  .send(inst)
                  .set('Authorization', token.id)
                  .expect(200)
                  .end( function(err, res) {
                     var body = res.body;
                     body.type = inst.type;
                     models = [body];
                     //Logout before running the tests
                     api.post('/api/journalists/logout')
                     .set('Authorization', token.id)
                     .expect(204)
                     .end( function(err,res) {
                        dump(err, res);
                        done(err,res);
                     });
                  });
               }
               else {
                  console.log('No model found for pre test creation');
                  //Logout before running the tests
                  api.post('/api/journalists/logout')
                  .set('Authorization', token.id)
                  .expect(204)
                  .end( function(err,res) {
                     dump(err, res);
                     done(err,res);
                  });
               }
            });
         });

         describe('running', function(done) {
            testEndpoint('/api', tests, role, done);
         });
      });
   });
};

exports.run = function() {
   testModel(apps);
};

