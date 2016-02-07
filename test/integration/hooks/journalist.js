
var LIMIT = 10;

/*jshint expr: true*/
var depend = require('../../depend');
var on = depend.On();

var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-datetime'));

var common =  require('../../common');
var app = common.app;
var api = common.api;

var Journalists = app.models.journalist;
var Stats = app.models.stat;
var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;

var genericModels = require('../../genericModels');

var purgeDB = function(cb) {
  Articles.destroyAll(function(err) {
    if(err) return cb(err);
    Subarticles.destroyAll(function(err) {
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

    describe('before create', function() {

      var user;
      var name;
      beforeEach( function() {
        user = {
          password: 'password',
          username: name,
          email: name + '@instanews.com'
        };
      });

      before( function(done) {
        name = common.generate.randomString();
        user = {
          password: 'password',
          username: name,
          email: name + '@instanews.com'
        };

        Journalists.create(user, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          done();
        });
      });

      it('should complain about a weak password', function(done) {

        user.password = 'toshort';
        api.post('/api/journalists')
        .send(user)
        .expect(422)
        .end( function(err, res) {

          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.text).to.exist;
          var error = JSON.parse(res.text);
          expect(error).to.exist;
          expect(error.error).to.exist;
          expect(error.error).to.exist;
          expect(error.error.message).to.exist;
          expect(error.error.message).to.equal('Password is too weak!');
          done();
        });
      });

      it('should complain about the email being used already', function(done) {

        user.username = 'bababab';
        api.post('/api/journalists')
        .send(user)
        .expect(403)
        .end( function(err, res) {

          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.text).to.exist;
          var error = JSON.parse(res.text);
          expect(error).to.exist;
          expect(error.error).to.exist;
          expect(error.error).to.exist;
          expect(error.error.message).to.exist;
          expect(error.error.message).to.equal('Username or email is already used!');
          done();
        });
      });

      it('should complain about the username being used already', function(done) {

        user.email = 'bababab@babab.com';
        api.post('/api/journalists')
        .send(user)
        .expect(403)
        .end( function(err, res) {

          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.text).to.exist;
          var error = JSON.parse(res.text);
          expect(error).to.exist;
          expect(error.error).to.exist;
          expect(error.error).to.exist;
          expect(error.error.message).to.exist;
          expect(error.error.message).to.equal('Username or email is already used!');
          done();
        });
      });
    });

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

    describe('login', function () {
      var user;

      before( function (done) {
        user = {
          username: Math.round(Math.random()*1000000).toString()
        };

        user.email = user.username + '@instanews.com';
        user.password = 'password';

        api.post('/api/journalists')
        .send(user)
        .expect(200)
        .end(function (err, res) {
          expect(err).to.not.exist;
          expect(res.body.error).to.not.exist;
          done();
        });
      });

      it('should be able to login with email', function (done) {
        api.post('/api/journalists/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(200)
        .end(function (err, res) {
          expect(err).to.not.exist;
          expect(res.body.error).to.not.exist;
          done();
        });
      });

      it('should be able to login with username', function (done) {
        api.post('/api/journalists/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(200)
        .end(function (err, res) {
          expect(err).to.not.exist;
          expect(res.body.error).to.not.exist;
          done();
        });
      });
    });

    on.article().describe('Using journalist', function () {
      it('should not include the journalists email or password when accessing the model', function(done) {
        var user = on.Users.getDefault();
        /*
         * The password does not get stripped until exiting the server
         * so using supertest is needed
         */
        api.get('/api/journalists/' + user.userId)
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
        object.username = common.generate.randomString();
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

    on.subarticle().on.article().plus.subarticle().describe('Checking de-duplication', function () {
      it('should not return duplicate articles when requesting articles of a journalist', function(done) {
        var user = on.Users.getDefault();
        var sub = on.Instances.getActionableInstance();
        /*
         * Apparently loopback does not set the relations up until the server
         * is officially running. So supertest is required to test this hook
         */
        api.get('/api/journalists/'+ user.userId +'/articles')
        .expect(200)
        .end( function(err,res) {
          if(err) return done(err);

          expect(res).to.exist;
          expect(res.body).to.exist;
          expect(res.body.length).to.equal(1);
          expect(res.body[0].id).to.equal(sub.parentId.toString());
          done();
        });
      });
    });
  });
};
