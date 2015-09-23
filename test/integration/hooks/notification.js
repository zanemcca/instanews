
var LIMIT = 20;

/*jshint expr: true*/
var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;

var common =  require('../../common');
var app = common.app;

var Notifications = app.models.notif;

var genericModels = require('../../genericModels');

exports.run = function() {
   describe('Notification', function() {

      before(function(done) {
         Notifications.destroyAll( function(err) {
            done(err);
         });
      });

      it('should make a creation date and should update the modified date', function(done) {

         var notification = common.findModel('notifications', genericModels);
         if(!notification) {
            console.log('Error:  There was no notification model. The following test will likely fail');
            expect(false).to.be.true;
         }

         Notifications.create(notification, function(err, res) {
            if(err) return done(err);

            expect(res).to.exist;
            expect(res.created).to.equalDate(new Date());
            expect(res.modified).to.exist;

            var date = res.modified;

            res.seen = true;
            setTimeout(function() {
               Notifications.upsert(res, function(err, notif) {
                  if(err) return done(err);

                  expect(notif).to.exist;
                  expect(notif.date).to.equal(res.date);
                  expect(notif.modified).to.be.afterTime(date);
                  done();
               });
            }, 10);
         });
      });

      it('should be limited to ' + LIMIT + ' notifications returned' , function(done) {

         var notification = common.findModel('notifications', genericModels);
         if(!notification) {
            console.log('Error:  There was no notification model. The following test will likely fail');
            expect(false).to.be.true;
         }

			var objects = 0;
			var Objects = Notifications;
			var object = notification;

			var createObject = function() {
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

      //TODO Test that the notification gets pushed to
            //TODO android
            //TODO ios
   });
};
