
/*jshint expr: true*/
var expect = require('chai').expect;
var async = require('async');

var common =  require('../../common');
var depend = require('../../depend');
var on = depend.On();
var UpVote = on.models.upVote;

var app = common.app;

var Articles = app.models.Article;

exports.run = function() {
  describe('UpVote', function() {
    on.article().by('ted').describe('Create upvote', function() {
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
          username: 'bill',
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

      // I don't know if this gives us as much value as headache so skipping for now
      describe.skip('simultaneous voters', function (done) {
        this.timeout(10000);
        var total = 10;
        var users = [];
        before(function () {
          var funcs = [];
          var newUser = function(cb) {
            on.Users.create(function(err, user) {
              on.Users.add(user);
              users.push(user.userId);
              cb(err);
            });
          };

          for(var i = 0; i < total; i++) { 
            funcs.push(newUser);
          }

          async.parallel(funcs, done);
        });

        it('should be able to add multiple upVotes simultaneously', function(done) {
          var count = 0;

          var art = on.Instances.getActionableInstance();
          var create = function (username) {
            UpVote.create({
              clickableType: 'article',
              clickableId: art.id,
              location: art.location,
              username: username
            }, function(err, vote) {
              if(err) return done(err);
              expect(vote).to.exist;
              count++;
              if( count === total) {
                setTimeout(function() {
                  Articles.findById(vote.clickableId, function(err,res) {
                    expect(res).to.exist;
                    expect(res.upVoteCount).to.equal(total);
                    done(err);
                  });
                }, 1000);
              }
            });
          };

          function creator(i) {
            if(i > 0) {
              create(users[i]);
              setTimeout(function () {
                creator(i - 1);
              }, 200);
            }
          }

          creator(total);
        });

      });
    });

    on.article().plus.upVote().describe('upVote again by the same user', function () {
      it('should return an error', function(done) {
        UpVote.create(function(err, vote) {
          expect(err).to.exist;
          done();
        });
      });
    });

    on.upVote().on.article().plus.downVote().describe('Replace downVote with upvote', function() {
      it('should update the upVoteCount of the artcle voted on and decrement the downVoteCount', function(done) {
        var vote = on.Instances.getActionableInstance();
        Articles.findById(vote.clickableId, function(err,res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.upVoteCount).to.equal(1);
          expect(res.downVoteCount).to.equal(0);
          done();
        });
      });
    });
  });
};
