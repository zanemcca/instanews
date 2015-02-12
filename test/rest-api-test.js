
/*jslint maxlen: 130 */

var should = require('chai').should(),
    supertest = require('supertest'),
    app = require('../server/server'),
    api = supertest(app),
    assert = require('assert');

var importer = require('./sample-data/import');

var journalists = require('./sample-data/journalist.json');
var Role = app.models.Role;
var RoleMapping = app.models.RoleMapping;

// Test to see that anyone can get articles
describe('REST', function() {

   this.timeout(10000);

   before( function(done) {
      importer(app, done);
   });

   //Guest rest testing
   describe('Guest', function() {
      //Test access to the articles
      describe('Articles', function() {
         it('A guest should be able to get an article', function(done) {
            api.get('/api/articles/1')
            .expect(200,done);
         });

         it('A guest should be able to get all articles', function(done) {
            api.get('/api/articles')
            .expect(200,done);
         });

         it('A guest should be allowed to get all subarticles of an article', function(done) {
            api.get('/api/articles/1/subarticles')
            .expect(200,done);
         });

         it('A guest should be allowed to get all journalists associated with an article', function(done) {
            api.get('/api/articles/1/journalists')
            .expect(200,done);
         });

         it('A guest should NOT be allowed to create an article', function(done) {
            api.post('/api/articles')
            .expect(401,done);
         });

         it('A guest should NOT be allowed to put an article', function(done) {
            api.put('/api/articles/1')
            .expect(401,done);
         });

         it('A guest should NOT be allowed to update an article', function(done) {
            api.post('/api/articles/update')
            .expect(401,done);
         });
         it('A guest should NOT be allowed to delete an article', function(done) {
            api.delete('/api/articles/1')
            .expect(401,done);
         });
      });

      //Test access to subarticles
      describe('Subarticles', function() {

         it('A guest should NOT be able to get a subarticle', function(done) {
            api.get('/api/subarticles/1')
            .expect(401,done);
         });

         it('A guest should NOT be able to get all subarticles', function(done) {
            api.get('/api/subarticles')
            .expect(401,done);
         });

         it('A guest should NOT be allowed to create a subarticle', function(done) {
            api.post('/api/subarticles')
            .expect(401,done);
         });

         it('A guest should NOT be allowed to put a subarticle', function(done) {
            api.put('/api/subarticles/1')
            .expect(401,done);
         });

         it('A guest should NOT be allowed to update a subarticle', function(done) {
            api.post('/api/subarticles/update')
            .expect(401,done);
         });

         it('A guest should NOT be allowed to delete a subarticle', function(done) {
            api.delete('/api/subarticles/1')
            .expect(401,done);
         });
      });

      //Test access to journalists
      describe('Journalists', function() {
         it('A guest should be able to get a journalist', function(done) {
            api.get('/api/journalists/1')
            .expect(200,done);
         });

         it('A guest should be able to get all articles of a journalist', function(done) {
            api.get('/api/journalists/1/articles')
            .expect(200,done);
         });

         it('A guest should NOT be able to get all journalists', function(done) {
            api.get('/api/journalists')
            .expect(401,done);
         });

      });

      //Test votes
      /*
      describe('Votes', function() {
         it('A guest should NOT be able to get a votes', function(done) {
            api.get('/api/votes/1')
            .expect(401,done);
         });

         it('A guest should NOT be able to get votes', function(done) {
            api.get('/api/votes')
            .expect(401,done);
         });

         it('A guest should NOT be able to update a votes', function(done) {
            api.post('/api/votes/update')
            .expect(401,done);
         });

         it('A guest should NOT be able to delete a votes', function(done) {
            api.delete('/api/votes/1')
            .expect(401,done);
         });
      });
      */
   });

   describe('Admin', function() {

      user = journalists[0];
      var credentials = { email: user.email, password: user.password };
      var token;

      before( function(done) {
         //console.log('Admin is: '+ user.firstName + ' @ id :' + user.journalistId);

         api.post('/api/journalists/login')
         .send(credentials)
         .expect(200)
         .end(function(err, res) {
            if (err) return done(err);

            token = res.body;
            assert(token.userId === user.journalistId);
            //console.log('Token : ' + token.id);
            done();
         });
      });

      describe('Articles', function() {
         it('Admin should be able to get all articles', function(done) {
            api.get('/api/articles')
            .set('Authorization', token.id)
            .expect(200,done);
         });
      });

      describe('Subarticles', function() {
         it('Admin should be able to get all subarticles', function(done) {
            api.get('/api/subarticles')
            .set('Authorization', token.id)
            .expect(200,done);
         });
      });
   });
});

