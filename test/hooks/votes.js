
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var app = common.app;

var Articles = app.models.Article;

var genericModels = require('../genericModels');

exports.run = function() {
   var article = common.findModel('articles', genericModels);
   if(!article) {
      console.log('Error: Article model is invalid so the following tests will likely fail!');
   }

   describe('Votes', function() {
      it('should have initialized properly', function(done) {
         Articles.create(article, function(err, res) {
            expect(!err);
            expect(res);
            expect(res.upVoteCount === 0);
            expect(res.downVoteCount === 0);
            //Maybe make this a bit more specific
            expect(res.date);
            done(err);
         });
      });

      //TODO Check that the modification date and rating get updated properly
   });
};
