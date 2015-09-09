
/*jshint expr: true*/

var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;

var Articles = app.models.Article;
var View = app.models.view;
var DownVotes = app.models.DownVote;

var genericModels = require('../../genericModels');

exports.run = function() {
   describe('DownVote', function() {
      var article = common.findModel('articles', genericModels);
      if(!article) {
         console.log('Error: Article model is invalid so the following tests will likely fail!');
      }

      it('should update the downVoteCount of the artcle voted on', function(done) {
         Articles.create(article, function(err, res) {

            if(err) return done(err);
            expect(res).to.exist;

            DownVotes.create({
               clickableType: 'article',
               clickableId: res.id
            }, function(err, vote) {

               if(err) return done(err);
               expect(vote).to.exist;

               Articles.findById(res.id, function(err,res) {
                  if(err) return done(err);
                  expect(res).to.exist;
                  expect(res.downVoteCount).to.equal(1);
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
                expect(res.downVoteCount).to.equal(20);
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
            DownVotes.create({
               clickableType: 'article',
               clickableId: res.id,
               location: res.location
            }, cb);
          }

          next(res, done);
        });
      });
   });
};
