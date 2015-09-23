
/*jshint expr: true*/

var expect = require('chai').expect;

var depend = require('../../depend');
var on = depend.on;
var DownVote = depend.downVote;

var common =  require('../../common');
var app = common.app;

var Articles = app.models.Article;

exports.run = function() {
  describe('DownVote', function() {
    on.article().describe('Create downvote', function () {
      it('should update the downVoteCount of the article voted on', function(done) {
        DownVote.create(function(err, vote) {
          if(err) return done(err);
          expect(vote).to.exist;

          Articles.findById(vote.clickableId, function(err,res) {
            if(err) return done(err);
            expect(res).to.exist;
            expect(res.downVoteCount).to.equal(1);
            done();
          });
        });
      });

      it('should be able to add multiple votes simultaneously', function(done) {
        var total = 20;
        var count = 0;

        var create = function () {
          DownVote.create(function(err, vote) {
            if(err) return done(err);
            expect(vote).to.exist;
            count++;
            if( count === total) {
              Articles.findById(vote.clickableId, function(err,res) {
                if(err) return done(err);
                expect(res).to.exist;
                expect(res.downVoteCount).to.equal(20);
                done();
              });
            }
          });
        };

        for( var i = 0; i < total; i++) {
          //1000 votes/sec
          setTimeout(create, 1);
        }
      });
    });
  });
};
