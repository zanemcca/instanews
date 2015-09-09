
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../../common');
var app = common.app;

var Installations = app.models.installation;

var genericModels = require('../../genericModels');

exports.run = function() {
   describe('Installation', function() {
      var installation = common.findModel('installations', genericModels);
      if(!installation) {
         console.log('Error: No valid installation model was found so the following test cases will likely fail!');
      }

      it('should only allow a single installation per unique device combination', function(done) {

         Installations.destroyAll( function(err) {
            if(err) return done(err);

            Installations.create(installation, function(err, res) {
               if(err) return done(err);

               Installations.create(installation, function(err, res) {
                  expect(err.message).to.equal('Device is already installed. Updating');

                  Installations.create(installation, function(err, res) {
                     expect(err.message).to.equal('Device is already installed. Updating');

                     done();
                  });
               });
            });
         });
      });

   });
};
