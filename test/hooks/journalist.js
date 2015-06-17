
var LIMIT = 10;

/*jshint expr: true*/
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-datetime'));

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

			  app.bruteDB.collection('store').remove( {}, function(err) {
				 if (err) {
					console.log(err);
					return cb(err);
				 }
				 cb();
			  });
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

		it('should limit the login attempts for the user', function(done) {

		  this.timeout(5000);

		  var limit = 10;
		  var attempts = 0;
		  var lastDate = null;
		  var date;
		  var delay = 0;
		  var delayLast = 0;

		  var badUser = journalist;
		  badUser.password = 'akjgnbsaDOFIUJBO34987thg98h3598nberfjgn';
		  var attemptLogin = function() {
			 if(attempts < limit) {
				attempts++;
				//Journalists.login(badUser, function(err, res) {
				api.post('/api/journalists/login')
				.end( function(err, res) {
				  var error = res.body.error;
				  expect(error).to.exist;

				  if(res.status === 429) {
					 expect(error.nextValidRequestDate).to.exist;
					 if( lastDate ) {
						date = new Date(error.nextValidRequestDate);
						expect(date).to.be.afterTime(lastDate);

						delayLast = delay;
						delay = date - lastDate;
						expect(delay).to.be.above(delayLast);
					 }
					 lastDate = new Date(error.nextValidRequestDate);
					 setTimeout( attemptLogin, lastDate - Date.now());
				  }
				  else {
					 attemptLogin();
				  }
				});
			 }
			 else {
				done();
			 }
		  };

		  attemptLogin();

		});

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

      it('should be limited to ' + LIMIT + ' journalists returned' , function(done) {

		  this.timeout(10000);

			var objects = 0;
			var Objects = Journalists;
			var object = journalist;


			var createObject = function() {
			  object.username = Math.floor(Math.random() * 100000).toString();
			  object.email = object.username + '@instanews.com';

			  if(objects >= LIMIT + 5) {
				 Objects.find(function(err, res) {
					 if(err) return done(err);

					 expect(res).to.exist;
					 expect(res.length).to.equal(LIMIT);
					 done();
				 });
			  }
			  else {
				 objects++;

				 Objects.create(object, function(err, art) {
					 if(err) return done(err);
					 createObject();
				 });
			  }
			};

			createObject();
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
