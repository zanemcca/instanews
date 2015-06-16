
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var api = common.api;

exports.run = function() {
   describe('Security', function() {
	  describe('error returned', function() {

		if(process.env.NODE_ENV === 'production' ||
		  process.env.NODE_ENV === 'staging') {
			it('should not include stack trace', function(done) {

			  api.get('/a/nonexistent/endpoint')
			  .expect(404)
			  .end( function(err, res) {
				 expect(res).to.exist;
				 expect(res.body).to.exist;
				 expect(res.body.error).to.exist;
				 expect(res.body.error).to.equal('404: This is not the page you are looking for ...'); 
				 expect(res.body.error.stack).to.not.exist;
				 done();
			  });
			});
		 }

		 it('should not show the "X-Powered-By"', function(done) {

			api.get('/api/articles')
			.expect(200)
			.end( function(err, res) {
			  expect(res).to.exist;
			  expect(res.header).to.exist;
			  expect(res.header['x-powered-by']).to.not.exist;
			  done();
			});
		 });
	  });
   });
};
