
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;

var Articles = app.models.Article;
var UpVotes = app.models.UpVote;
var Journalists = app.models.Journalist;

var genericModels = require('../../genericModels');

exports.run = function() {
   describe('UpVote', function() {

     var article; 
     var user;

     beforeEach(function(done) {

      article = common.findModel('articles', genericModels);
      user = {
        username: 'bob',
        email: 'b@b.ca',
        password: 'password'
      };

      expect(article).to.exist;
      Journalists.destroyAll(function(err) {
        if(err) done(err);
        else {
          Journalists.create(user, function(err, res) {
            done(err);
          });
        }
      });

     after(function(done) {
       Journalists.destroyAll( function(err) {
         done(err);
       });
     });

    });

      it('should update the upVoteCount of the artcle voted on and not verify the article', function(done) {
         Articles.create(article, function(err, res) {

            if(err) return done(err);
            expect(res).to.exist;

            UpVotes.create({
               clickableType: 'article',
               clickableId: res.id,
               username: user.username,
               location: {
                  lat: res.location.lat + 1,
                  lng: res.location.lng
               }
            }, function(err, vote) {

               if(err) return done(err);
               expect(vote).to.exist;

               Articles.findById(res.id, function(err,res) {
                  if(err) return done(err);
                  expect(res).to.exist;
                  expect(res.upVoteCount).to.equal(1);
                  expect(res.verified).to.be.false;
                  done();
               });
            });
         });
      });

      it('should update the upVoteCount of the artcle voted on and verify the article', function(done) {
         Articles.create(article, function(err, res) {

            if(err) return done(err);
            expect(res).to.exist;

            UpVotes.create({
               clickableType: 'article',
               clickableId: res.id,
               username: user.username,
               location: res.location
            }, function(err, vote) {

               if(err) return done(err);
               expect(vote).to.exist;

               Articles.findById(res.id, function(err,res) {
                  if(err) return done(err);
                  expect(res).to.exist;
                  expect(res.upVoteCount).to.equal(1);
                  expect(res.verified).to.be.true;
                  done();
               });
            });
         });
      });

      it('should be able to add multiple votes simultaneously', function(done) {

        var total = 20;
        var count = 0;

        var next = function(article, cb) {
          if( count === total) {
             Articles.findById(article.id, function(err,res) {
                if(err) return done(err);
                expect(res).to.exist;
                expect(res.upVoteCount).to.equal(20);
                cb();
             });
          }
        };

        Articles.create(article, function(err, res) {
          if(err) return done(err);
          expect(res).to.exist;

          var cb = function(err, vote) {
             if(err) return done(err);
             expect(vote).to.exist;
             count++;
             next(res, done);
          };

          var create  = function() {
            UpVotes.create({
               clickableType: 'article',
               clickableId: res.id,
               username: user.username,
               location: res.location
            }, cb);
          };

          for( var i = 0; i < total; i++) {
            //Rate of 50 upvotes/sec
            setTimeout(create, 25*i);
          }

          next(res, done);
        });
      });
   });
};
