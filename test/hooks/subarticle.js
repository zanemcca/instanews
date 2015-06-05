
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var app = common.app;

var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;

var genericModels = require('../genericModels');

exports.run = function() {
   var subarticle = common.findModel('subarticles', genericModels);
   if(!subarticle) {
      console.log('Error: Subarticle model is invalid so the following tests will likely fail!');
   }

   describe('Subarticle', function() {

      //TODO Test that a notification has been created for the necessary users
            //associated with the subarticle

      it('should have the video poster set', function(done) {
         Subarticles.create(subarticle, function(err, res) {
            //TODO assure that the video poster has been created and set
            done(err);
         });
      });

   });
};
