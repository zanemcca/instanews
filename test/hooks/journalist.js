
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var app = common.app;
var api = common.api;

var Journalists = app.models.journalist;
var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;

var genericModels = require('../genericModels');

var purgeDB = function(cb) {
   Articles.destroyAll(function(err) {
      if(err) return cb(err);

      Subarticles.destroyAll(function(err) {
         if(err) return cb(err);

         Journalists.destroyAll( function(err) {
            if(err) return cb(err);
            cb();
         });
      });
   });
};

exports.run = function() {
   describe('Journalist', function() {

      before( function(done) {
         purgeDB(done);
      });

      after( function(done) {
         purgeDB(done);
      });

      var journalist = common.findModel('journalists', genericModels);
      if(!journalist) {
         console.log('Error: No valid journalist was found. The following test cases will likely fail!');
      }

      it('should not include the journalists email or password when accessing the model', function(done) {

         Journalists.create(journalist, function(err, res) {
            if(err) return done(err);

            expect(res).to.exist;

            /*
             * The password does not get stripped until exiting the server
             * so using supertest is needed
             */
            api.get('/api/journalists/' + journalist.username)
            .expect(200)
            .end( function(err, res) {
               if(err) return done(err);

               expect(res).to.exist;
               expect(res.body).to.exist;
               expect(res.body.email).to.be.undefined;
               expect(res.body.password).to.be.undefined;
               done();
            });

         });
      });

      it('should not return duplicate articles when requesting articles of a journalist', function(done) {

         journalist.username = 'ken';
         journalist.email = 'ken@instanews.com';

         Journalists.create(journalist, function(err, res) {
            if(err) return done(err);
            var article = common.findModel('articles', genericModels);
            if(!article) {
               console.log('Error: Invalid article!');
               expect(false).to.be.true;
               return done();
            }

            Articles.create(article, function(err, art) {
               if(err) return done(err);
               var subarticle = common.findModel('subarticles', genericModels);
               if(!subarticle) {
                  console.log('Error: Invalid subarticle!');
                  expect(false).to.be.true;
                  return done();
               }

               subarticle.parentId = art.id;
               subarticle.username = journalist.username;

               Subarticles.create(subarticle, function(err, res) {
                  if(err) return done(err);

                  Subarticles.create(subarticle, function(err, res) {
                     if(err) return done(err);

                     /*
                      * Apparently loopback does not set the relations up until the server
                      * is officially running. So supertest is required to test this hook
                      */
                     api.get('/api/journalists/'+ journalist.username +'/articles')
                     .expect(200)
                     .end( function(err,res) {
                        if(err) return done(err);

                        expect(res).to.exist;
                        expect(res.body).to.exist;
                        expect(res.body.length).to.equal(1);
                        expect(res.body[0].id).to.equal(art.id.toString());
                        done();
                     });
                  });
               });
            });
         });
      });
   });
};
