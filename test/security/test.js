
/*jshint expr: true*/
var expect = require('chai').expect;

var common =  require('../common');
var api = common.api;

exports.run = function() {
   describe('Security', function() {
	  describe('error returned', function() {

		if(process.env.NODE_ENV === 'production') {
			it('should not include stack trace', function(done) {

			  api.get('/api/nonexistentendpoint')
			  .expect(404)
			  .end( function(err, res) {
				 expect(res).to.exist;
				 expect(res.text).to.exist;
				 var error = JSON.parse(res.text);

				 expect(error).to.exist;
				 expect(error.error.status).to.equal(404);
				 expect(error.error.stack).to.be.undefined;
				 done();
			  });
			});
		 }
	  });
   });
};
