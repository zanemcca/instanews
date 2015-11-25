
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
    findById: function () {},
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
              id: true,
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

    describe('clearPending', function (id, next) {
      describe('findById', function () {
        var findById, id, err, res;
        beforeEach(function () {
          err = null;
          res = null;
          id = 'id';
          findById = function (id, where, cb) {
            cb(err, res);
          };

          sandbox.stub(Article, 'findById', function (id, where, cb) {
            findById(id, where,cb);
          });
        });

        it('should be call with the proper arguments', function (done) {
          findById = function (Id, where, cb) {
            expect(Id).to.equal(id);
            expect(where).to.deep.equal({
              pending: {
                exists: true
              }
            });
            done();
          };

          Article.clearPending(id);
        });

        it('should propogate the error', function (done) {
          err = 'err';

          Article.clearPending(id, function (error) {
            expect(error).to.equal(err);
            done();
          });
        });

        describe('updateAttributes', function () {
          var update, err;
          beforeEach(function () {
            update = function (data, cb) {
             cb(err); 
            };

            res = {
              updateAttributes: function (data, cb) {
                update(data,cb);
              }
            };
          });

          it('should be call with the proper arguments', function (done) {
            update = function (data, cb) {
              expect(data).to.deep.equal({
                $unset: {
                  pending: '' 
                }
              });
              done();
            };

            Article.clearPending(id);
          });

          it('should propogate the error', function (done) {
            err = 'err';

            Article.clearPending(id, function (error) {
              expect(error).to.equal(err);
              done();
            });
          });
        });
      });
    });
  });
};
