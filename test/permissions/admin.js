
var common = require('../common');
var api = common.api;
var assert = common.assert;
var dump = common.dump;

var journalists = require('../sample-data/journalist.json');

var user = journalists[0];
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
      console.log(token.userId+ '\t' + user.username);
      assert(token.userId === user.username);
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
         "_votes": {
            "rate": 5,
            "rating": 0,
            "myId": 100,
            "lastUpdated": "2015-02-10T12:48:43.511Z",
         },
         "myId": 100,
         "location":{
            "lat": 38.7884036,
            "lng": -124.4208504
         }
      };

      it('Admin should be allowed to create an article', function(done) {
         api.post('/api/articles')
         .send(article)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      article.location.lat = 40.7884036;

      it('Admin should be allowed to put an article', function(done) {
         api.put('/api/articles')
         .send(article)
         .set('Authorization', token.id)
         .expect(200,done);
      });

      /*
      article.location.lng = -50.4208504;
      it('Admin should be allowed to update an article', function(done) {
         api.post('/api/articles/update')
         .send(article)
         .set('Authorization', token.id)
         .expect(200,done);
      });
      */

      it('Admin should be allowed to delete an article', function(done) {
         api.delete('/api/articles/100')
         .set('Authorization', token.id)
         .expect(204, done);
      });
   });

});

//Test access to subarticles
describe('Subarticles', function() {

   it('Admin should be able to get a subarticle', function(done) {
      api.get('/api/subarticles/1')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be able to get all subarticles', function(done) {
      api.get('/api/subarticles')
      .set('Authorization', token.id)
      .expect(404,done);
   });

   it('Admin should be able to get all comments on a subarticles', function(done) {
      api.get('/api/subarticles/1/comments')
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
         subarticle ={
             "title": "Sweet blazing glory",
             "text": "Holy crap look at that!",
             "_votes": {
                  "rate": -6,
                  "rating": 0,
                  "myId": 101,
                  "lastUpdated": "2015-02-06T12:48:43.511Z"
             },
             "date": "2015-02-06T12:48:43.511Z",
             "myId": 100,
             "parentId": 1,
             "username": "zane"
         };
         done();
      });

      it('Admin should be allowed to create a subarticle', function(done) {
         api.post('/api/subarticles')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200,done);
      });

      it('Admin should be allowed to put a subarticle', function(done) {
         api.put('/api/subarticles')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200,done);
      });

      /*
      it('Admin should be allowed to update a subarticle', function(done) {
         api.post('/api/subarticles/update')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200,done);
      });
      */

      it('Admin should be allowed to delete a subarticle', function(done) {
         api.delete('/api/subarticles/'+ subarticle.myId)
         .set('Authorization', token.id)
         .expect(204, done);
      });
   });
});

//Test access to journalists
describe('Journalists', function() {
   it('Admin should be able to get a journalist', function(done) {
      api.get('/api/journalists/zane')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be able to get all articles of a journalist', function(done) {
      api.get('/api/journalists/zane/articles')
      .set('Authorization', token.id)
      .expect(200,done);
   });

   it('Admin should be able to get all journalists', function(done) {
      api.get('/api/journalists')
      .set('Authorization', token.id)
      .expect(200,done);
   });

});

describe('Comments', function() {

   var comment;
   before( function(done) {
      comment = {
        "content": "Nuts!",
        "date": "2015-02-06T12:48:43.511Z",
        "_votes": {
          "rate": 1,
          "rating": 1,
          "myId": 103,
          "lastUpdated": "2015-02-06T12:48:43.511Z"
        },
        "myId": 100,
        "username" : "bob",
        "commentableId": 1,
        "commentableType": "comment"
      };
      done();
   });

   it('Admin should NOT be able to create a comment directly', function(done) {
      api.post('/api/comments')
      .set('Authorization', token.id)
      .send(comment)
      .expect(404)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('Admin should be able to comment on a comment', function(done) {
      api.post('/api/comments/'+ comment.commentableId + '/comments')
      .set('Authorization', token.id)
      .send(comment)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('Admin should NOT be able to update a comment', function(done) {
      api.put('/api/comments/'+comment.myId)
      .set('Authorization', token.id)
      .send(comment)
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('Admin should be able to delete a comment', function(done) {
      api.delete('/api/comments/'+comment.myId)
      .set('Authorization', token.id)
      .expect(204)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

});
