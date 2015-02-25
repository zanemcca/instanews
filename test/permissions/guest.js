
var common = require('../common');
var api = common.api;
var dump = common.dump;

//Test access to the articles
describe('Articles', function() {
   it('A guest should be able to get an article', function(done) {
      api.get('/api/articles/1')
      .expect(200,done);
   });

   it('A guest should NOT be able to upvote an article', function(done) {
      api.post('/api/articles/1/upvote')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('A guest should NOT be able to downvote an article', function(done) {
      api.post('/api/articles/1/downvote')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
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

   describe('Modify', function() {
      it('A guest should NOT be allowed to create an article', function(done) {
         api.post('/api/articles')
         .expect(401,done);
      });

      it('A guest should NOT be allowed to put an article', function(done) {
         api.put('/api/articles/1')
         .expect(401,done);
      });

      it('A guest should NOT be allowed to update an article', function(done) {
         api.put('/api/articles')
         .expect(401,done);
      });
      it('A guest should NOT be allowed to delete an article', function(done) {
         api.delete('/api/articles/1')
         .expect(401,done);
      });
   });
});

//Test access to subarticles
describe('Subarticles', function() {

   it('A guest should NOT be able to upvote a subarticle', function(done) {
      api.post('/api/subarticles/1/upvote')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('A guest should NOT be able to downvote a subarticle', function(done) {
      api.post('/api/subarticles/1/downvote')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('A guest should NOT be able to get a subarticle', function(done) {
      api.get('/api/subarticles/1')
      .expect(401,done);
   });

   it('A guest should NOT be able to get all subarticles', function(done) {
      api.get('/api/subarticles')
      .expect(404,done);
   });

   it('A guest should be able to get all comments on a subarticles', function(done) {
      api.get('/api/subarticles/1/comments')
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });


   describe('Modify', function() {
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
         .expect(404,done);
      });

      it('A guest should NOT be allowed to delete a subarticle', function(done) {
         api.delete('/api/subarticles/1')
         .expect(401,done);
      });
   });
});

//Test access to journalists
describe('Journalists', function() {
   it('A guest should be able to get a journalist', function(done) {
      api.get('/api/journalists/zane')
      .expect(200,done);
   });

   it('A guest should be able to get all articles of a journalist', function(done) {
      api.get('/api/journalists/zane/articles')
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

describe('Comments', function() {

   var comment = {};

   it('A guest should NOT be able to create a comment directly', function(done) {
      api.post('/api/comments')
      .send(comment)
      .expect(404)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('A guest should NOT be able to upvote an comment', function(done) {
      api.post('/api/comments/1/upvote')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('A guest should NOT be able to downvote an comment', function(done) {
      api.post('/api/comments/1/downvote')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('A guest should NOT be able to comment on a comment', function(done) {
      api.post('/api/comments/1/comments')
      .send(comment)
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('A guest should NOT be able to update a comment', function(done) {
      api.put('/api/comments/1')
      .send(comment)
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('A guest should NOT be able to delete a comment', function(done) {
      api.delete('/api/comments/1')
      .expect(401)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

});
