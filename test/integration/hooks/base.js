
var LIMIT = 50;

/*jshint expr: true*/
var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;

var depend = require('../../depend');
var on = depend.On();
var Article = on.models.article;

var common =  require('../../common');
var app = common.app;
var Articles = app.models.Article;

exports.run = function() {
  describe('Base', function() {
    on.article().describe('', function () {
      it('should have initialized properly', function() {
        var art = on.Instances.getActionableInstance();
        expect(art).to.exist;
        expect(art.upVoteCount).to.equal(0);
        expect(art.downVoteCount).to.equal(0);

        expect(new Date(art.created)).to.equalDate(new Date());
        expect(new Date(art.modified)).to.equalDate(new Date());
      });

      describe('',function () {
        this.timeout(25000);
        before(function(done) {
          var objects = 0;
          var check = function() {
            if(objects === LIMIT) {
              setTimeout(done, 500);
            }
            else {
              objects++;
              Article.create(function(err, art) {
                if(err) return done(err);
                check();
              });
            }
          };
          check();
        });

        it('should be limited to ' + LIMIT + ' base objects returned' , function(done) {
          Articles.find(function(err, res) {
            if(err) return done(err);

            expect(res).to.exist;
            expect(res.length).to.equal(LIMIT);
            done();
          });
        });
      });
    });
  });
};
