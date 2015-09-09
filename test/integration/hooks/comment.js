
/*jshint expr: true*/

var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;
var runTillDone = common.runTillDone;

var Article = app.models.Article;
var Subarticle = app.models.Subarticle;
var Comment = app.models.Comment;
var Notification = app.models.notif;

var genericModels = require('../../genericModels');

exports.run = function () {
  describe('Comment', function () {

   //Old tests
   var comment = common.findModel('comments', genericModels);
   if(!comment) {
      console.log('Error: Comment model is invalid so the following tests will likely fail!');
   }

    it('should have "comment" as the modelName', function(done) {
       Comment.create(comment, function(err, res) {
          expect(res).to.exist;
          expect(res.modelName).to.equal('comment');
          done(err);
       });
    });

    it('should create a notification for commenting on an article', function(done) {
       var article = common.findModel('articles', genericModels);
       if(!article) {
          console.log('Error: Invalid article!');
          expect(false).to.be.true;
          done();
       }
       else {
          //Create the article to be commented on
          Article.create(article, function(err, res) {
             if(err) {
                done(err);
             }
             else {
                expect(res).to.exist;
                expect(res.id).to.exist;

                var subarticle = common.findModel('subarticles', genericModels);
                if(!subarticle) {
                   console.log('Error: Invalid subarticle!');
                   expect(false).to.be.true;
                   return done();
                }

                var tempComment = comment;
                tempComment.username = 'bob';
                tempComment.commentableType = 'article';
                tempComment.commentableId = res.id;

                subarticle.parentId = res.id;
                subarticle.username = 'jane';

                //Create a subarticle so that whose owner will recieve
                //the notification
                Subarticle.create(subarticle, function(err, res) {
                   if(err) return done(err);

                   //Create the comment that will trigger a notification
                   Comment.create(tempComment, function(err,res) {
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
                                  expect(res[0].username).to.equal('jane');
                                  expect(res[0].message).to
                               .equal('bob commented on an article you contributed to');
                                  stop();
                               }
                            });
                         }, done);
                      }
                   });
                });
             }
          });
       }
    });

    it('should create a notification for commenting on a subarticle', function(done) {
       var subarticle = common.findModel('subarticles', genericModels);
       if(!subarticle) {
          console.log('Error: Invalid subarticle!');
          expect(false).to.be.true;
          return done();
       }

       subarticle.username = 'jane';

       //Create a subarticle so that whose owner will recieve
       //the notification
       Subarticle.create(subarticle, function(err, res) {
          if(err) done(err);

          var tempComment = comment;
          tempComment.username = 'bob';
          tempComment.commentableType = 'subarticle';
          tempComment.commentableId = res.id;

          //Create the comment that will trigger a notification
          Comment.create(tempComment, function(err,res) {
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
                         expect(res[0].username).to.equal('jane');
                         expect(res[0].message).to
                      .equal('bob commented on your subarticle');
                         stop();
                      }
                   });
                }, done);
             }
          });
       });
    });

    it('should create a notification for commenting on your comment', function(done) {

       var tempComment = comment;
       tempComment.username = 'jane';

       //Create a subarticle so that whose owner will recieve
       //the notification
       Comment.create(tempComment, function(err, res) {
          if(err) return done(err);

          tempComment.username = 'bob';
          tempComment.commentableType = 'comment';
          tempComment.commentableId = res.id;

          //Create the comment that will trigger a notification
          Comment.create(tempComment, function(err,res) {
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
                         expect(res[0].username).to.equal('jane');
                         expect(res[0].message).to
                      .equal('bob commented on your comment');
                         stop();
                      }
                   });
                }, done);
             }
          });
       });
    });

    it('should create a notification for commenting on a comment that you have commented on', function(done) {

       var tempComment = comment;
       tempComment.username = 'jane';

       //Create a subarticle so that whose owner will recieve
       //the notification
       Comment.create(tempComment, function(err, res) {
          if(err) return done(err);

          tempComment.username = 'bob';
          tempComment.commentableType = 'comment';
          tempComment.commentableId = res.id;

          Comment.create( tempComment, function(err,res) {
             if(err) {
                done(err);
             }
             else {
                expect(res).to.exist;

                tempComment.username = 'alice';
                //Create the comment that will trigger a notification
                Comment.create(tempComment, function(err,res) {
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
                               if(res[0].username === 'jane') {
                                  expect(res[0].username).to.equal('jane');
                                  expect(res[0].message).to
                                  .equal('alice commented on your comment');
                                  expect(res[1].username).to.equal('bob');
                                  expect(res[1].message).to
                                  .equal('alice commented on a comment stream that you are part of');
                               }
                               else {
                                  expect(res[1].username).to.equal('jane');
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
             }
          });
       });
   });
 });
};
