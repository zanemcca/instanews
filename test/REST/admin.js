
var common = require('../common');
var api = common.api;
var assert = common.assert;

var journalists = require('../sample-data/journalist.json');

user = journalists[0];
var credentials = { email: user.email, password: user.password };
var token;

//Login as the admin before executing these test cases
before( function(done) {
   api.post('/api/journalists/login')
   .send(credentials)
   .expect(200)
   .end(function(err, res) {
      if (err) return done(err);

      token = res.body;
      assert(token.userId === user.journalistId);
      done();
   });
});

describe('Articles', function() {
   it('Admin should be able to get an article', function(done) {
      api.get('/api/articles/1')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be able to get all articles', function(done) {
      api.get('/api/articles')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be allowed to get all subarticles of an article', function(done) {
      api.get('/api/articles/1/subarticles')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be allowed to get all journalists associated with an article', function(done) {
      api.get('/api/articles/1/journalists')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   describe('Modify', function(done) {

      var article =  {
         "isPrivate": false,
         "date": "2015-02-10T12:48:43.511Z",
         "votes": {
            "up": 50,
            "down": 10,
            "rate": 5,
            "lastUpdated": "2015-02-10T12:48:43.511Z",
         },
         "articleId": 100,
         "location":{
            "lat": 38.7884036,
            "lng": -124.4208504
         }
      };

      it('Admin should be allowed to create an article', function(done) {
         api.post('/api/articles')
         .send(article)
         .set('Authorization', token.id)
         .expect(200,done);
      });

      it('Admin should be allowed to delete an article', function(done) {
         api.delete('/api/articles/100')
         .set('Authorization', token.id)
         .expect(204, done);
      });
   });

   it('Admin should be allowed to put an article', function(done) {
      api.put('/api/articles/1')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be allowed to update an article', function(done) {
      api.post('/api/articles/update')
      .set('Authorization', token.id)
      .expect(200,done);
   });
});

//Perform tests on the Subarticles API
describe('Subarticles', function() {
   it('Admin should be able to get all subarticles', function(done) {
      api.get('/api/subarticles')
      .set('Authorization', token.id)
      .expect(200,done);
   });
});
