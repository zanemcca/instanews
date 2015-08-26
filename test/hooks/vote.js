
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var app = common.app;
var runTillDone = common.runTillDone;

var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;
var Comments = app.models.Comment;
var Notifications = app.models.notif;
var UpVotes = app.models.UpVote;
var Journalists = app.models.Journalist;
var Stats = app.models.Stat;

var genericModels = require('../genericModels');

exports.run = function() {
   describe('vote', function() {

     //Create Journalists
     beforeEach(function(done) {
       Journalists.destroyAll( function(err) {
         if(err) done(err); 
         else {
           Journalists.create({
             username: 'jane',
             email: 'j@ma.ca',
             password: 'password'
           }, function(err, res) {
             if( err) done(err);
             else {
               Journalists.create({
                 username: 'bob',
                 email: 'b@ma.ca',
                 password: 'password'
               }, function(err, res) {
                 done(err);
               });
             }
           });
         }
       });
     });

     after(function(done) {
       Journalists.destroyAll( function(err) {
         done(err);
       });
     });

      it('should create a notification for the top contributor for voting on an article', function(done) {
         var article = common.findModel('articles', genericModels);
         if(!article) {
            console.log('Error: Invalid article!');
            expect(false).to.be.true;
            return done();
         }

         //Create the article to be voted on
         Articles.create(article, function(err, res) {
            if(err) return done(err);
            expect(res).to.exist;
            expect(res.id).to.exist;


            var subarticle = common.findModel('subarticles', genericModels);
            if(!subarticle) {
               console.log('Error: Invalid subarticle!');
               expect(false).to.be.true;
               return done();
            }

            subarticle.username = 'jane';
            subarticle.parentId = res.id;

            //Create a subarticle so that whose owner will recieve
            //the notification
            Subarticles.create(subarticle, function(err, res) {
               if(err) return done(err);

               UpVotes.create({
                  votableType: 'article',
                  votableId: res.parentId,
                  username: 'bob'
               }, function(err, res) {
                  if(err) return done(err);

                  //Wait until the notification appears and ensure it
                  //is properly formated
                  runTillDone( function(stop) {
                     Notifications.find({
                        where: {
                           notifiableType: res.votableType,
                           notifiableId: res.votableId
                        }
                     },function(err, res) {
                        if(!err && res && res.length > 0) {
                           expect(res.length).to.equal(1);
                           expect(res[0].username).to.equal('jane');
                           expect(res[0].message).to
                        .equal('bob voted on your article');
                           stop();
                        }
                     });
                  }, done);
               });
            });
         });
      });

      it('should create a notification for voting on a subarticle', function(done) {
         var subarticle = common.findModel('subarticles', genericModels);
         if(!subarticle) {
            console.log('Error: Invalid subarticle!');
            expect(false).to.be.true;
            return done();
         }

         subarticle.username = 'jane';

         //Create a subarticle so that whose owner will recieve
         //the notification
         Subarticles.create(subarticle, function(err, res) {
            if(err) return done(err);

            UpVotes.create({
               votableType: 'subarticle',
               votableId: res.id,
               username: 'bob'
            }, function(err, res) {
               if(err) return done(err);

               //Wait until the notification appears and ensure it
               //is properly formated
               runTillDone( function(stop) {
                  Notifications.find({
                     where: {
                        notifiableType: res.votableType,
                        notifiableId: res.votableId
                     }
                  },function(err, res) {
                     if(!err && res && res.length > 0) {
                        expect(res.length).to.equal(1);
                        expect(res[0].username).to.equal('jane');
                        expect(res[0].message).to
                     .equal('bob voted on your subarticle');
                        stop();
                     }
                  });
               }, done);
            });
         });
      });

      it('should create a notification for voting on a comment', function(done) {
         var comment = common.findModel('comments', genericModels);
         if(!comment) {
            console.log('Error: Invalid comment!');
            expect(false).to.be.true;
            return done();
         }

         comment.username = 'jane';
         comment.commentableId = 287929520349346563576536;

         //Create a comment so that the owner will recieve
         //the notification
         Comments.create(comment, function(err, res) {
            if(err) return done(err);

            UpVotes.create({
               votableType: 'comment',
               votableId: res.id,
               username: 'bob'
            }, function(err, res) {
               if(err) return done(err);

               //Wait until the notification appears and ensure it
               //is properly formated
               runTillDone( function(stop) {
                  Notifications.find({
                     where: {
                        notifiableType: res.votableType,
                        notifiableId: res.votableId
                     }
                  },function(err, res) {
                     if(!err && res && res.length > 0) {
                        expect(res.length).to.equal(1);
                        expect(res[0].username).to.equal('jane');
                        expect(res[0].message).to
                     .equal('bob voted on your comment');
                        stop();
                     }
                  });
               }, done);
            });
         });
      });
   });
};
