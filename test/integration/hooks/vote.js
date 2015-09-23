
/*jshint expr: true*/
var expect = require('chai').expect;

var depend = require('../../depend');
var on = depend.on;

var common =  require('../../common');
var app = common.app;
var runTillDone = common.runTillDone;

var Notifications = app.models.notif;

exports.run = function() {
  describe('vote', function() {
    on.upVote().on.article().plus.subarticle().by('bob').describe('Check for notification', function () {
      it('should create a notification for the top contributor for voting on an article', function(done) {
        var vote = depend.instances.getActionableInstance();
        //Wait until the notification appears and ensure it
        //is properly formated
        runTillDone( function(stop) {
          Notifications.find({
            where: {
              notifiableType: vote.clickableType,
              notifiableId: vote.clickableId
            }
          },function(err, res) {
            if(!err && res && res.length > 0) {
              expect(res.length).to.equal(1);
              expect(res[0].username).to.equal('bob');
              expect(res[0].message).to
              .equal(vote.username + ' voted on your article');
              stop();
            }
          });
        }, done);
      });
    });

    on.upVote().on.subarticle().by('bob').describe('Check for notification', function () {
      it('should create a notification for voting on a subarticle', function(done) {
        var vote = depend.instances.getActionableInstance();
        runTillDone( function(stop) {
          Notifications.find({
            where: {
              notifiableType: vote.clickableType,
              notifiableId: vote.clickableId
            }
          },function(err, res) {
            if(!err && res && res.length > 0) {
              expect(res.length).to.equal(1);
              expect(res[0].username).to.equal('bob');
              expect(res[0].message).to
              .equal(vote.username + ' voted on your subarticle');
              stop();
            }
          });
        }, done);
      });
    });

    on.upVote().on.comment().by('bob').describe('Check for notification', function () {
      it('should create a notification for voting on a comment', function(done) {
        var vote = depend.instances.getActionableInstance();
        runTillDone( function(stop) {
          Notifications.find({
            where: {
              notifiableType: vote.clickableType,
              username: 'bob',
              notifiableId: vote.clickableId
            }
          },function(err, res) {
            if(!err && res && res.length > 0) {
              expect(res.length).to.equal(1);
              expect(res[0].username).to.equal('bob');
              expect(res[0].message).to
              .equal(vote.username + ' voted on your comment');
              stop();
            }
          });
        }, done);
      });
    });
  });
};
