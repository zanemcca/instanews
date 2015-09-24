
/*jshint expr: true*/
var expect = require('chai').expect;

var depend = require('../../depend');
var on = depend.On();
var Subarticle = on.models.subarticle;

var common =  require('../../common');
var app = common.app;
var runTillDone = common.runTillDone;

var Notifications = app.models.notif;

exports.run = function() {
  describe('Subarticle', function() {
    on.article().plus.subarticle().by('bob').describe('Create a subarticle', function () {
      it('should send a notification to other users who have contributed to the same article', function(done) {
        Subarticle.create(function(err, sub) {
          if(err) return done(err);

          runTillDone( function(stop) {
            Notifications.find({
              where: {
                notifiableType: 'article',
                notifiableId: sub.parentId
              }
            }, function(err, res) {
              if(!err && res && res.length > 0) {
                expect(res.length).to.equal(1);
                expect(res[0].username).to.equal('bob');
                expect(res[0].message).to
                .equal(sub.username + ' collaborated with you on an article');
                stop();
              }
            });
          },done);
        });
      });
    });
  });
};
