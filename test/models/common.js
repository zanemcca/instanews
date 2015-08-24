
/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');

var c = require('../common');
var Article = c.app.models.Article;

var common = require(c.serverDir + 'models/common');

exports.run = function() {
  describe('Common', function() {
    describe('findAndModify', function() {
      var modify = {};
      var article = {};

      beforeEach(function(done) {
        modify = function(res, extra) {
          var ret = [];
          for(var i = 0; i < res.length; i++) {
            var temp = res[i];
            temp.rating += extra;
            ret.push(temp);
          }
          return ret;
        };

        Article.create({
          isPrivate: false,
          location: {
            lat: 50,
            lng: -60
          }
        }, function(err, res) {
          if(err) {
            console.log('Error: Failed to create an article for the test');
            done(err);
          }
          else {
            article = res;
            done();
          }
        });
      });

      it('should find and modify the value appropriately', function(done) {
        common.findAndModify(Article, {
          where: {
            id: article.id 
          }
        }, modify,function(err, res) {
          expect(err.length).to.equal(0);
          expect(res).to.equal(1);
          Article.find({
            where: {
              id: article.id
            }
          }, function(err, res) {
            if(err) {
              done(err);
            }
            else {
              expect(res.length).to.equal(1);
              expect(res[0].version).to.equal(1);
              expect(res[0].rating).to.equal(5);
              done();
            }
          });
        }, 5); 
      });

      it('should have a conflict because the version number is different than expected',
      function(done) {
        var Model = {
          find: function(query, cb) {
            cb(null, [{
              id: 'id',
              version: 0
            }]);
          },
          updateAll: function(where, instance, cb) {
            cb(null, {count: 0});
          }
        };

       common.findAndModify(
         Model,
         {},
         modify,
         function(err, res) {
           expect(err.length).to.equal(1);
           expect(res).to.equal(0);
           done();
       },
       5);
      });
    });
  });
};
