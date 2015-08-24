
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var app = common.app;

var Articles = app.models.Article;
var UpVotes = app.models.UpVote;

var genericModels = require('../genericModels');

exports.run = function() {
   describe('UpVote', function() {

      var article = common.findModel('articles', genericModels);
      if(!article) {
         console.log('Error: Article model is invalid so the following tests will likely fail!');
      }

      it('should update the upVoteCount of the artcle voted on and not verify the article', function(done) {
         Articles.create(article, function(err, res) {

            if(err) return done(err);
            expect(res).to.exist;

            UpVotes.create({
               votableType: 'article',
               votableId: res.id,
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
               votableType: 'article',
               votableId: res.id,
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

          for( var i = 0; i < total; i++) {
            //Rate of 200 upvotes/sec
            setTimeout(function() {
              UpVotes.create({
                 votableType: 'article',
                 votableId: res.id,
                 location: res.location
              }, cb);
            }, 100*i);
          }

          next(res, done);
        });
      });
   });
};
