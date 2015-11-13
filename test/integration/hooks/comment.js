
/*jshint expr: true*/

var expect = require('chai').expect;

var common =  require('../../common');
var depend = require('../../depend');
//All tests in this file will share one On intance
var on = depend.On();

var app = common.app;
var api = common.api;
var runTillDone = common.runTillDone;

var Comment = on.models.comment;

var Notification = app.models.notif;

exports.run = function () {
  describe('Comment', function () {
    on.article().describe('create comment', function() {
      it('should have "comment" as the modelName', function(done) {
        Comment.create(function(err, res) {
          expect(res).to.exist;
          expect(res.modelName).to.equal('comment');
          done(err);
        });
      });
    });

    /*
     * TODO Re-enable these once notifications are finished
    on.comment().by('bob').describe('create comment', function() {
      it('should create a notification for bob', function(done) {
        Comment.create(function(err, comment) {
          if(err) {
            done(err);
          }
          else {
            expect(comment).to.exist;

            //Wait until the notification appears and ensure it
            //is properly formated
            runTillDone( function(stop) {
              Notification.find({
                where: {
                  notifiableType: 'comment',
                  notifiableId: comment.id
                }
              }, function(err, res) {
                if(!err && res && res.length > 0) {
                  expect(res.length).to.equal(1);
                  expect(res[0].username).to.equal('bob');
                  expect(res[0].message).to
                  .equal(comment.username + ' commented on your comment');
                  stop();
                }
              });
            }, done);
          }
        });
      });
    });
    on.subarticle().describe('create comment', function() {
      it('should create a notification for the author', function(done) {
        //Create the comment that will trigger a notification
        Comment.create(function(err,res) {
          if(err) {
            done(err);
          }
          else {
            expect(res).to.exist;
            //Wait until the notification appears and ensure it
            //is properly formated
            runTillDone( function(stop) {
              Notification.find({
                where: {
                  notifiableType: 'comment',
                  notifiableId: res.id
                }
              },function(err, res) {
                if(!err && res && res.length > 0) {
                  expect(res.length).to.equal(1);
                  expect(res[0].username).to.equal('bob');
                  expect(res[0].message).to
                  .equal(user.username + ' commented on your subarticle');
                  stop();
                }
              });
            }, done);
          }
        });
      });
    });
    
    on.article().by('bob').describe('create comment', function(done) {
      //TODO Split into two separate tests
      //TODO Actually trigger the article owner notification
      it('should create a notification for the article owner and the top contributor', function(done) {
        //Create the comment that will trigger a notification
        Comment.create(function(err,res) {
          if(err) {
            done(err);
          }
          else {
            expect(res).to.exist;
            //Wait until the notification appears and ensure it
            //is properly formated
            runTillDone( function(stop) {
              Notification.find({
                where: {
                  notifiableType: 'comment',
                  notifiableId: res.id
                }
              }, function(err, res) {
                if(!err && res && res.length > 0) {
                  expect(res.length).to.equal(1);
                  console.log(res);
                  expect(res[0].username).to.equal('bob');
                  expect(res[0].message).to
                  .equal(user.username + ' commented on an article you contributed to');
                  stop();
                }
              });
            }, done);
          }
        });
      });
    });

    on.comment().plus.comment().by('bob').describe('create comment', function() {
      it('should create a notification for bob', function(done) {
        Comment.create(function(err,res) {
          if(err) {
            done(err);
          }
          else {
            expect(res).to.exist;

            //Wait until the notification appears and ensure it
            //is properly formated
            runTillDone( function(stop) {
              Notification.find({
                where: {
                  notifiableType: 'comment',
                  notifiableId: res.id
                }
              }, function(err, res) {
                if(!err && res && res.length > 1) {
                  expect(res.length).to.equal(2);
                  if(res[0].username === 'bob') {
                    expect(res[0].username).to.equal('bob');
                    expect(res[0].message).to
                    .equal('alice commented on your comment');
                    expect(res[1].username).to.equal('bob');
                    expect(res[1].message).to
                    .equal('alice commented on a comment stream that you are part of');
                  }
                  else {
                    expect(res[1].username).to.equal('bob');
                    expect(res[1].message).to
                    .equal('alice commented on your comment');
                    expect(res[0].username).to.equal('bob');
                    expect(res[0].message).to
                    .equal('alice commented on a comment stream that you are part of');
                  }
                  stop();
                }
              });
            }, done);
          }
        });
      });
    });

    */

  });
};
