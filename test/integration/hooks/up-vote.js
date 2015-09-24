
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../../common');
var depend = require('../../depend');
var on = depend.On();
var UpVote = on.models.upVote;

var app = common.app;

var Articles = app.models.Article;

exports.run = function() {
  describe('UpVote', function() {
    on.article().describe('Create upvote', function() {
      it('should update the upVoteCount of the artcle voted on and not verify the article', function(done) {
        var res = on.Instances.getActionableInstance();
        UpVote.create({
          clickableType: 'article',
          clickableId: res.id,
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

      it('should update the upVoteCount of the artcle voted on and verify the article', function(done) {
        var res = on.Instances.getActionableInstance();
        UpVote.create({
          clickableType: 'article',
          clickableId: res.id,
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

      it('should be able to add multiple votes simultaneously', function(done) {

        this.timeout(10000);
        var total = 10;
        var count = 0;

        var art = on.Instances.getActionableInstance();
        var create = function () {
          UpVote.create({
            clickableType: 'article',
            clickableId: art.id,
            location: art.location,
            username: common.generate.randomString()
          }, function(err, vote) {
            if(err) return done(err);
            expect(vote).to.exist;
            count++;
            if( count === total) {
              Articles.findById(vote.clickableId, function(err,res) {
                expect(res).to.exist;
                expect(res.upVoteCount).to.equal(total);
                done(err);
              });
            }
          });
        };

        function creator(i) {
          if(i > 0) {
            create();
            setTimeout(function () {
              creator(i - 1);
            }, 200);
          }
        }

        creator(total);
      });
    });
  });
};
