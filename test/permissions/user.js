
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
      assert(token.userId === user.username);
      done();
   });
});

describe('Articles', function() {

   it('User should be able to upvote an article', function(done) {
      api.post('/api/articles/1/upVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('User should be able to upvote an article', function(done) {
      api.post('/api/articles/1/upVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('User should be able to downvote an article', function(done) {
      api.post('/api/articles/1/downVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

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

   it('User should be allowed to get all comments on an article', function(done) {
      api.get('/api/articles/1/comments')
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
      var comment;
      before( function(done) {
         article =  {
            "title": "Boring article",
            "isPrivate": false,
            "date": "2015-02-10T12:48:43.511Z",
            "id": 200,
            "location":{
               "lat": 45.61950,
               "lng": -65.45772
            }
         };
         comment = {
           "content": "Nuts!",
           "date": "2015-02-06T12:48:43.511Z",
           "id": 201,
           "username" : user.username,
           "commentableId": article.id,
           "commentableType": "article"
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

      it('User should be able to create a comment on a article', function(done) {
         api.post('/api/articles/'+ article.id + '/comments')
         .send(comment)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should NOT be able to update a comment on their article', function(done) {
         api.put('/api/articles/'+ article.id + '/comments/'+comment.id)
         .set('Authorization', token.id)
         .send(comment)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should NOT be able to delete a comment on a their article', function(done) {
         api.delete('/api/articles/'+ article.id + '/comments/'+comment.id)
         .set('Authorization', token.id)
         .expect(401)
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
         api.delete('/api/articles/'+ article.id)
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

   it('User should be able to upvote a subarticle', function(done) {
      api.post('/api/subarticles/1/upVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('User should be able to downvote a subarticle', function(done) {
      api.post('/api/subarticles/1/downVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });


   it('User should NOT be able to get all subarticles', function(done) {
      api.get('/api/subarticles')
      .set('Authorization', token.id)
      .expect(404)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to get all comments on a subarticles', function(done) {
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
      var comment;
      before( function(done) {
         subarticle = {
            "text" : "There is a blaze!",
            "username": user.username,
            "parentId": 1,
            "date": "2015-02-08T12:48:43.511Z",
         };
         comment = {
           "content": "Nuts!",
           "date": "2015-02-06T12:48:43.511Z",
           "id": 200,
           "username": user.username,
           "commentableId": subarticle.id,
           "commentableType": "subarticle"
         };
         done();
      });

      it('User should be allowed to create their own subarticle', function(done) {
         api.post('/api/subarticles')
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            subarticle = res.body;
            dump(err, res);
            done(err,res);
         });
      });

      it('User should be able to create a comment on a subarticle', function(done) {
         api.post('/api/subarticles/'+ subarticle.id + '/comments')
         .send(comment)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should NOT be able to update a comment on their subarticle', function(done) {
         api.put('/api/subarticles/'+ subarticle.id + '/comments/'+comment.id)
         .set('Authorization', token.id)
         .send(comment)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should NOT be able to delete a comment on a their subarticle', function(done) {
         api.delete('/api/subarticles/'+ subarticle.id + '/comments/'+comment.id)
         .set('Authorization', token.id)
         .expect(401)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });


      it('User should be allowed to update their subarticle', function(done) {
         api.put('/api/subarticles/'+ subarticle.id)
         .send(subarticle)
         .set('Authorization', token.id)
         .expect(200)
         .end( function(err, res) {
            dump(err, res);
            done(err,res);
         });
      });

      it('User should be allowed to delete their own subarticle', function(done) {
         api.delete('/api/subarticles/'+ subarticle.id)
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
         subArt.username = 1;
         subArt.id = 1;

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
         api.delete('/api/subarticles/'+ subarticle.id)
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
      api.get('/api/journalists/zane')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to get all articles of a journalist', function(done) {
      api.get('/api/journalists/zane/articles')
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

describe('Comments', function() {

   var comment;
   before( function(done) {
      comment = {
        "content": "Nuts!",
        "date": "2015-02-06T12:48:43.511Z",
        "username": user.username,
        "commentableId": 1,
        "commentableType": "comment"
      };
      done();
   });

   it('User should NOT be able to create a comment directly', function(done) {
      api.post('/api/comments')
      .set('Authorization', token.id)
      .send(comment)
      .expect(404)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to upvote an comment', function(done) {
      api.post('/api/comments/1/upVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('User should be able to downvote an comment', function(done) {
      api.post('/api/comments/1/downVotes')
      .set('Authorization', token.id)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err, res);
      });
   });

   it('User should be able to comment on a comment', function(done) {
      api.post('/api/comments/'+ comment.commentableId + '/comments')
      .set('Authorization', token.id)
      .send(comment)
      .expect(200)
      .end( function(err, res) {
         //Replace the comment with the returned result so that we have
         //a valid id element
         comment = res.body;
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to update their comment', function(done) {
      api.put('/api/comments/'+comment.id)
      .set('Authorization', token.id)
      .send(comment)
      .expect(200)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

   it('User should be able to delete their comment', function(done) {
      api.delete('/api/comments/'+ comment.id)
      .set('Authorization', token.id)
      .expect(204)
      .end( function(err, res) {
         dump(err, res);
         done(err,res);
      });
   });

});
