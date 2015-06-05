
/*jshint expr: true*/
var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;

var common =  require('../common');
var app = common.app;

var Articles = app.models.Article;
var UpVotes = app.models.UpVote;

var genericModels = require('../genericModels');

exports.run = function() {
   var article = common.findModel('articles', genericModels);
   if(!article) {
      console.log('Error: Article model is invalid so the following tests will likely fail!');
   }

   describe('Votes', function() {
      it('should have initialized properly', function(done) {
         Articles.create(article, function(err, art) {
            if(err) return done(err);
            expect(art).to.exist;
            expect(art.upVoteCount).to.equal(0);
            expect(art.downVoteCount).to.equal(0);
            expect(art.date).to.equalDate(new Date());
            expect(art.modified).to.equalDate(new Date());

            done();
         });
      });

      it('should update the rating and modified date but not the original date', function(done) {
         Articles.create(article, function(err, art) {
            if(err) return done(err);
            expect(art).to.exist;
            expect(art.upVoteCount).to.equal(0);
            expect(art.downVoteCount).to.equal(0);
            expect(art.date).to.equalDate(new Date());

            UpVotes.create({
               votableType: 'article',
               votableId: art.id
            }, function(err, res) {
               if(err) return done(err);

               expect(res).to.exist;

               Articles.findById(res.votableId, function(err, res) {
                  if(err) return done(err);

                  expect(res).to.exist;
                  expect(res.rating).to.be.above(art.rating);
                  expect(res.modified).to.be.above(art.modified);
                  expect(res.date).to.equalTime(art.date);
                  done();
               });

            });
         });
      });
   });
};
