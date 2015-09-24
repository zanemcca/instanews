
/*jshint expr: true*/

var expect = require('chai').expect;

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

      it('should be able to add multiple votes simultaneously', function(done) {

        this.timeout(10000);
        //var then = Date.now();

        var total = 10;
        var count = 0;

        var art = on.Instances.getActionableInstance();
        var create = function () {
          /*
          var now = Date.now();
          console.log('Created after ' + (now-then) + 'ms');
          */
          DownVote.create({
            clickableType: 'article',
            clickableId: art.id,
            location: art.location,
            username: common.generate.randomString()
          }, function(err, vote) {
            if(err) return done(err);
            expect(vote).to.exist;
            count++;
            /*
            now = Date.now();
            console.log('Finished after ' + (now-then) + 'ms');
           */
            if( count === total) {
              Articles.findById(vote.clickableId, function(err,res) {
                expect(res).to.exist;
                expect(res.downVoteCount).to.equal(total);
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
