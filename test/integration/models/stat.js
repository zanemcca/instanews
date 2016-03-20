
/*jshint expr: true*/

var depend = require('../../depend');
var on = depend.On();

var expect = require('chai').expect;
var sinon = require('sinon');

var common = require('../../common');
var app = common.app;
var Article = app.models.Article;

var stat = common.req('models/stat');

exports.run = function() {
  //TODO The update of the rating is deferred now so these tests need updating
  describe.skip('Stat', function() {
    var tests = ['article', 'subarticle', 'comment'];
    tests.forEach(function (type) {
      on[type]().plus.upVote().describe(type, function() {
        it('should increase the rating', function(done) {
          var model = on.Instances.getActionableInstance();
          var Model = app.models[type];
          Model.findById(model.id, function (err, instance) {
            expect(err).to.not.exist;
            console.log('Before: ' + model.rating + '\tAfter: ' + instance.rating);
            expect(instance.rating).to.be.above(model.rating);
            done();
          });
        });
      });
/*
 * Not neccessarily true with the new bonus system
 * after the ranking settles this is accurate though
 *
      on[type]().plus.comment().describe(type, function() {
        it('should increase the rating', function(done) {
          var model = on.Instances.getActionableInstance();
          var Model = app.models[type];
          Model.findById(model.id, function (err, instance) {
            expect(err).to.not.exist;
            console.log('Before: ' + model.rating + '\tAfter: ' + instance.rating);
            expect(instance.rating).to.be.above(model.rating);
            done();
          });
        });
      });
     */

      on[type]().plus.downVote().describe(type, function() {
        it('should decrease the rating', function(done) {
          var model = on.Instances.getActionableInstance();
          var Model = app.models[type];
          Model.findById(model.id, function (err, instance) {
            expect(err).to.not.exist;
            console.log('Before: ' + model.rating + '\tAfter: ' + instance.rating);
            expect(instance.rating).to.be.below(model.rating);
            done();
          });
        });
      });
    });
  });
};
