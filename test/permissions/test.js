
var api = require('../common').api;
var expect = require('chai').expect;

var articles = require('./articles.json');

require('it-each')({ testPerIteration: true });

var dump = function(err, res) {
   if (err) {
      if(res.body.error) {
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


var token, tests = [];
var models = [];

var testOne = function(role, test, next) {
   var mainModel = findModel(tests.type, models);

   //If we are sending something it will be the model type
   //that appears at the end of the endpoint request string
   var type = tests.type;

   //Build our endpoint using our test object
   var endpoint = tests.endpoint;
   if( test.endpoint || test.endpoint === '') {
      endpoint += '/'+ mainModel.id;

      if(test.endpoint) {
         //Type is the submodel
         type = test.endpoint;

         endpoint += '/' + type;
         //Check if there is a submodel id that needs to be found
         if(type[type.length-1] === '/') {
            type = type.slice(0,type.length -1);
            var model = findModel(type, models);
            if (model && model.id) {
               endpoint += model.id;
            }
            /*
            else {
               console.log('Invalid submodel id:');
               console.log('\tPlease ensure the submodel has been initialized');
            }
            */
         }
      }
   }
   //console.log(test.type + ' ' + endpoint);

   var func;
   if(test.type === 'post') {
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
   else if(test.type === 'get') {
      func = api.get(endpoint);
   }
   else if(test.type === 'put') {
      //Try to find the model in the database
      var mod = findModel(type,models);

      func = api.put(endpoint).send(mod);
   }
   else if(test.type === 'delete') {
      func = api.delete(endpoint);
   }

   var res;
   if( role === 'admin') {
      res = test.admin;
   }
   else if( role === 'user') {
      res = test.user;
   }
   else if( role === 'guest') {
      res = test.guest;
   }

   func.set('Authorization', token.id)
   .expect(res)
   .end( function(err, res) {
      if(test.type === 'put' || test.type === 'post') {
         var body = res.body;
         body.type = type;
         models.push(body);
      }
      dump(err, res);
      next(err, res);
   });

};

var findModel = function(type, models) {
   for(var i = 0; i < models.length; i++) {
      if(models[i].type === type) {
         return models[i];
      }
   }
   //console.log('No model found for ' + type);
   return;
};

var test = function() {
   describe(tests.type, function() {

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

               var inst = findModel(tests.type, tests.models);
               api.post(tests.endpoint)
               .send(inst)
               .set('Authorization', token.id)
               .expect(200)
               .end( function(err, res) {
                  var body = res.body;
                  body.type = tests.type;
                  models = [body];
                  dump(err, res);
                  done(err,res);
               });
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

         it.each(tests.tests,
         'should get a %d when trying to %s',
         [role, 'it'],
         function(test,next) {
            testOne(role,test,next);
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

               var inst = findModel(tests.type, tests.models);
               api.post(tests.endpoint)
               .send(inst)
               .set('Authorization', token.id)
               .expect(200)
               .end( function(err, res) {
                  var body = res.body;
                  body.type = tests.type;
                  models = [body];
                  dump(err, res);
                  done(err,res);
               });
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

         it.each(tests.tests,
         'should get a %d when trying to %s',
         [role, 'it'],
         function(test,next) {
            testOne(role,test,next);
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
               var inst = findModel(tests.type, tests.models);
               api.post(tests.endpoint)
               .send(inst)
               .set('Authorization', token.id)
               .expect(200)
               .end( function(err, res) {
                  var body = res.body;
                  body.type = tests.type;
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
            });
         });

         it.each(tests.tests,
         'should get a %d when trying to %s',
         [role, 'it'],
         function(test,next) {
            testOne(role,test,next);
         });
      });
   });
};


exports.run = function() {
   tests = articles;
   test();
};
