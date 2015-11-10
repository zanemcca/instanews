
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var common =  require('../../common');

var app = common.req('server');

var Article =  {
  disableRemoteMethod: function () {},
  remoteMethod: function () {}
};

var findOne;
function start() {
  Article = {
    find: function () {},
    disableRemoteMethod: function () {},
    remoteMethod: function () {}
  };

  return common.req('models/article')(Article);
}

exports.run = function () {
  describe('Article', function () {
    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('getHeatMap', function () {
      var find;
      beforeEach(function () {
        start();
        find = function () {};
        sandbox.stub(Article, 'find', function (query, cb) {
          find(query, cb);
        });
      });

      it('should pass in the proper query to Article.find', function (done) {
        var box = [[45,-73],[45.1,-74]];
          find = function(query, cb) {
          expect(query).to.deep.equal({
            limit: 500,
            fields: {
              location: true,
              rating: true
            },
            where: {
              location: {
                geoWithin: {
                  $box: box
                }
              }
            },
            order: 'rating DESC'
          });
          cb(null, []);
          };

          Article.getHeatMap(box, function () {
            expect(Article.find.calledOnce).to.be.true;
            done();
          });
      });
    });
  });
};
