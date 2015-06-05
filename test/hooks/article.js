
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

   describe('Article', function() {
      it('should have "article" as the modelName', function(done) {
         Articles.create(article, function(err, res) {
            if(err) return done(err);
            expect(res).to.exist;
            expect(res.modelName).to.equal('article');
            done();
         });
      });
   });
};
