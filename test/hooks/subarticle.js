
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var app = common.app;
var runTillDone = common.runTillDone;

var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;
var Notifications = app.models.notif;

var genericModels = require('../genericModels');

exports.run = function() {
   var subarticle = common.findModel('subarticles', genericModels);
   if(!subarticle) {
      console.log('Error: Subarticle model is invalid so the following tests will likely fail!');
   }

   describe('Subarticle', function() {

      it('should send a notification to other users who have contributed to the same article', function(done) {
         var article = common.findModel('articles', genericModels);
         if(!article) {
            console.log('Error: Article model is invalid so the following tests will likely fail!');
         }

         Articles.create(article, function(err, res) {
            if(err) return done(err);

            expect(res).to.exist;

            var tempSub = subarticle;
            tempSub.parentId = res.id;
            tempSub.username = 'bob';

            Subarticles.create(tempSub, function(err, res) {
               if(err) return done(err);

               tempSub.username = 'ted';
               Subarticles.create(tempSub, function(err, res) {
                  if(err) return done(err);

                  runTillDone( function(stop) {
                     Notifications.find({
                        where: {
                           notifiableType: 'article',
                           notifiableId: res.parentId
                        }
                     }, function(err, res) {
                        if(!err && res && res.length > 0) {
                           expect(res.length).to.equal(1);
                           expect(res[0].username).to.equal('bob');
                           expect(res[0].message).to
                        .equal('ted collaborated with you on an article');
                           stop();
                        }
                     });
                  },done);
               });
            });
         });
      });

      it('should have the video poster set', function(done) {
         var tempSub =  subarticle;
         tempSub._file = {
            type: 'video',
            size: 1,
            name: 'A video title'
         };

         Subarticles.create(tempSub, function(err, res) {
            if(err) return done(err);

            expect(res).to.exist;
            expect(res._file).to.exist;
            expect(res._file.poster).to.exist;
            done();
         });
      });

   });
};
