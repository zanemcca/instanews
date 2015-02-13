
var common = require('../common');
var api = common.api;
var assert = common.assert;
var dump = common.dump;

var journalists = require('../sample-data/journalist.json');

var user = journalists[1];
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
   it('User should be able to get an article', function(done) {
      api.get('/api/articles/1')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('User should be able to get all articles', function(done) {
      api.get('/api/articles')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be allowed to get all subarticles of an article', function(done) {
      api.get('/api/articles/1/subarticles')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be allowed to get all journalists associated with an article', function(done) {
      api.get('/api/articles/1/journalists')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   describe('Modify', function(done) {

      var article;
      before( function(done) {
         article =  {
            "isPrivate": false,
            "date": "2015-02-10T12:48:43.511Z",
            "votes": {
               "up": 50,
               "down": 10,
               "rate": 5,
               "lastUpdated": "2015-02-10T12:48:43.511Z",
            },
            "articleId": 200,
            "location":{
               "lat": 38.7884036,
               "lng": -124.4208504
            }
         };
         done();
      });

      it('User should be allowed to create an article', function(done) {
         api.post('/api/articles')
         .send(article)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should NOT be allowed to put an article', function(done) {
         api.put('/api/articles')
         .send(article)
         .set('Authorization', token.id)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      /*
      article.location.lng = -50.4208504;
      it('User should be allowed to update an article', function(done) {
         api.post('/api/articles/update')
         .send(article)
         .set('Authorization', token.id)
         .expect(200,done);
      });
      */

      it('User should NOT be allowed to delete an article', function(done) {
         api.delete('/api/articles/'+ article.articleId)
         .set('Authorization', token.id)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });
   });

});

//Test access to subarticles
describe('Subarticles', function() {

   it('User should be able to get a subarticle', function(done) {
      api.get('/api/subarticles/1')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to get all subarticles', function(done) {
      api.get('/api/subarticles')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   describe('Modify', function() {
      var subarticle;
      before( function(done) {
         subarticle = {
            "title": "Fire!!!!!",
            "text" : "There is a blaze!",
            "subarticleId": 200,
            "journalistId": user.journalistId,
            "parentId": 1,
            "date": "2015-02-08T12:48:43.511Z",
            "votes" : {
               "up": 5,
               "down": 50,
               "rate": -6,
               "lastUpdated" : "2015-02-08T12:48:43.511Z"
            }
         };
         done();
      });

      it('User should be allowed to create their own subarticle', function(done) {
         api.post('/api/subarticles')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should be allowed to update their subarticle', function(done) {
         api.put('/api/subarticles/'+ subarticle.subarticleId)
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should be allowed to delete their own subarticle', function(done) {
         api.delete('/api/subarticles/'+ subarticle.subarticleId)
         .set('Authorization', token.id)
         .expect(204)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      /*
      it('User should NOT be allowed to create a subarticle for someone else', function(done) {
         api.post('/api/subarticles')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(401,done);
      });
      */

      it('User should NOT be allowed to update someone elses subarticle', function(done) {
         var subArt = subarticle;
         subArt.journalistId = 1;
         subArt.subarticleId = 1;

         api.put('/api/subarticles')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should NOT be allowed to delete someone elses subarticle', function(done) {
         api.delete('/api/subarticles/'+ subarticle.subarticleId)
         .set('Authorization', token.id)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });
   });
});

//Test access to journalists
describe('Journalists', function() {
   it('User should be able to get a journalist', function(done) {
      api.get('/api/journalists/1')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to get all articles of a journalist', function(done) {
      api.get('/api/journalists/1/articles')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should NOT be able to get all journalists', function(done) {
      api.get('/api/journalists')
      .set('Authorization', token.id)
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });
});
