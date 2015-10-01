
/*jshint expr: true*/

var expect = require('chai').expect;
var async = require('async');

var depend = require('../../depend');
var on = depend.On();
var DownVote = on.models.downVote;

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

      describe('simultaneous voters', function (done) {
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

        it('should be able to add multiple downVotes simultaneously', function(done) {
          var count = 0;

          var art = on.Instances.getActionableInstance();
          var create = function (username) {
            DownVote.create({
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
                    expect(res.downVoteCount).to.equal(total);
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

    on.downVote().on.article().plus.upVote().describe('Replace upVote with downVote', function() {
      it('should update the downVoteCount of the artcle voted on and decrement the upVoteCount', function(done) {
        var vote = on.Instances.getActionableInstance();
        Articles.findById(vote.clickableId, function(err,res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.downVoteCount).to.equal(1);
          expect(res.upVoteCount).to.equal(0);
          done();
        });
      });
    });
   });

};
