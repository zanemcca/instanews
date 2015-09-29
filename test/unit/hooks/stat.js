
/*jshint expr: true*/

var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;
var common =  require('../../common');
var app = common.app;
var sinon = require('sinon');

var Stat = app.models.Stat;

function run() {
  return common.req('hooks/stat')(app);
}

exports.run = function () {
  describe('Stat', function () {

    //Use sandbox for any beforeEach stubbing
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should have Stat.averageId set to "averageJoe"', function () {
      expect(Stat.averageId).to.equal('averageJoe');
    });

    describe('updateRating', function() {
      var where, type, modify, find, findById, update;
      beforeEach(function () {
        where = {
          id: 5
        };
        type = 'article';
        modify = function (model) {
          return model;
        };

        update = function (cb) {
          Stat.updateRating(where, type, modify, cb);
        };
      });

      describe('should return a 400 error code', function () {
        it('no where filter', function(done) {
          where = null;
          update(function (err) {
            expect(err.status).to.equal(400);
            done();
          });
        });

        it('no type given', function(done) {
          type = null;
          update(function (err) {
            expect(err.status).to.equal(400);
            done();
          });
        });
      });

      var rmw, readModifyWrite, prep;
      var getRating;
      beforeEach(function () {
        rmw = function (query, rate, cb, options) {
          cb();
        };

        prep = function (Model) {
          readModifyWrite = sandbox.stub(Model, 'readModifyWrite', rmw);
        };

        getRating = sandbox.stub(Stat, 'getRating', function(res, stats) {
          res.rating = 0.5;
          return res;
        });
      });

      it('should add < ratingModified to the where filter', function () {
        prep(app.models.article);
        update(function () {});
        expect(where.ratingModified.lt).to.exist;
        expect(where.ratingModified.lt).to.be.lt(new Date());
      });

      it('should return a 400 becaause the type is unknown', function (done) {
        prep(app.models.article);
        type  = 'click';
        update(function(err) {
          expect(err.status).to.equal(400);
          done();
        });
      });

      describe('Model.readModifyWrite', function() {
        afterEach(function() {
          expect(readModifyWrite.calledOnce).to.be.true;
        });

        describe('rate', function () {
          var checkRate;
          beforeEach(function () {
            rmw = function (query, rate, cb) {
              checkRate(rate);
              cb();
            };
            prep(app.models.article);

          });

          it('should call stat.getRating', function(done) {
            checkRate = function(rate) {
              var model = {rating: 0};
              model = rate(model);
              expect(getRating.calledOnce).to.be.true;
              expect(model.rating).to.equal(0.5);
            };
            update(done);
          });

          it('should set ratingModified', function(done) {
            checkRate = function(rate) {
              var model = {rating: 0};
              model = rate(model);
              expect(model.ratingModified).to.equalDate(new Date());
            };
            update(done);
          });

          it('should call modify', function(done) {
            modify = function(model) {
              return model;
            };

            checkRate = function(rate) {
              var model = {rating: 0};
              model = rate(model);
            };

            update(done);
          });

          it('should work without a modify function', function(done) {
            modify = null;

            checkRate = function(rate) {
              var model = {rating: 0};
              model = rate(model);
              expect(model.rating).to.equal(0.5);
            };
            update(done);
          });
        });

        it('should pass in the correct options to readModifyWrite', function(done) {
          rmw = function(query, rate, cb, options) {
            expect(options).to.exist;
            expect(options.customVersionName).to.equal('ratingVersion');
            expect(options.retryCount).to.equal(0);
            cb();
          };

          prep(app.models.article);

          update(done);
        });

        it('should propagate the error', function(done) {
          var error = 'error';
          rmw = function(query, rate, cb, options) {
            cb(error);
          };

          prep(app.models.article);

          update( function(err, res) {
            expect(err).to.equal(error);
            done();
          });
        });
      });
    });

    /*
       describe('updateRating', function() {
       var where, type, modify, find, findById, update;
       beforeEach(function () {
       where = {
id: 5
};
type = 'article';
modify = function (model) {
return model;
};
find = function (id, cb) {};

findById = sandbox.stub(Stat, 'findById', function(id, cb) {
return find(id,cb);
});

update = function (cb) {
Stat.updateRating(where, type, modify, cb);
};
});

describe('should return a 400 error code', function () {
it('no where filter', function(done) {
where = null;
update(function (err) {
expect(err.status).to.equal(400);
done();
});
});

it('no type given', function(done) {
type = null;
update(function (err) {
expect(err.status).to.equal(400);
done();
});
});
});

describe('findById', function () {
it('should pass in Stat.averageId', function (done) {
find = function(id, cb) {
expect(id).to.equal(Stat.averageId);
done();
};
update(done);
});

it('should propagate the error', function (done) {
var error ='error';
find = function(id, cb) {
cb(error);
};

update(function (err) {
expect(err).to.equal(error);
done();
});
});

it('should return a 404 because the stat was not found', function (done) {
find = function(id,cb) {
cb();
};
update(function(err) {
expect(err.status).to.equal(404);
done();
});
});

describe('valid stat found', function () {
    var rmw, readModifyWrite, prep;
    var getRating;
    var convert;
    beforeEach(function () {
      rmw = function (query, rate, cb, options) {
      cb();
      };

      prep = function (Model) {
      readModifyWrite = sandbox.stub(Model, 'readModifyWrite', rmw);
      };

      getRating = sandbox.stub(Stat, 'getRating', function(res, stats) {
        res.rating = 0.5;
        return res;
        });

      convert = sandbox.stub(Stat, 'convertRawStats', function (Model, Res) {
        expect(res).to.equal(Res);
        return res;
        });
      });

    var res;
    beforeEach(function() {
        res = {
subarticle: {
views: {
mean: 5
}
},
comment: {
views: {
mean: 15 
}
}
};

find = function(id, cb) {
cb(null, res);
};

});

it('should add < ratingModified to the where filter', function () {
    prep(app.models.article);
    update(function () {});
    expect(where.ratingModified.lt).to.exist;
    expect(where.ratingModified.lt).to.be.lt(new Date());
    });

it('should call Stat.convertRawStats', function () {
    prep(app.models.article);
    update(function () {});
    expect(convert.calledOnce).to.be.true;
    });

it('should return a 400 becaause the type is unknown', function (done) {
    prep(app.models.article);
    type  = 'click';
    update(function(err) {
      expect(err.status).to.equal(400);
      done();
      });
    });

describe('Model.readModifyWrite', function() {
    afterEach(function() {
      expect(readModifyWrite.calledOnce).to.be.true;
      });

    describe('rate', function () {
      var checkRate;
      beforeEach(function () {
        rmw = function (query, rate, cb) {
        checkRate(rate);
        cb();
        };
        prep(app.models.article);

        });

      it('should call stat.getRating', function(done) {
        checkRate = function(rate) {
        var model = {rating: 0};
        model = rate(model);
        expect(getRating.calledOnce).to.be.true;
        expect(model.rating).to.equal(0.5);
        };
        update(done);
        });

      it('should set ratingModified', function(done) {
          checkRate = function(rate) {
          var model = {rating: 0};
          model = rate(model);
          expect(model.ratingModified).to.equalDate(new Date());
          };
          update(done);
          });

      it('should call modify', function(done) {
          modify = function(model) {
          return model;
          };

          checkRate = function(rate) {
          var model = {rating: 0};
          model = rate(model);
          };

          update(done);
          });

      it('should work without a modify function', function(done) {
          modify = null;

          checkRate = function(rate) {
          var model = {rating: 0};
          model = rate(model);
          expect(model.rating).to.equal(0.5);
          };
          update(done);
          });
    });

    it('should pass in the correct options to readModifyWrite', function(done) {
        rmw = function(query, rate, cb, options) {
        expect(options).to.exist;
        expect(options.customVersionName).to.equal('ratingVersion');
        expect(options.retryCount).to.equal(0);
        cb();
        };

        prep(app.models.article);

        update(done);
        });

    it('should propagate the error', function(done) {
        var error = 'error';
        rmw = function(query, rate, cb, options) {
        cb(error);
        };

        prep(app.models.article);

        update( function(err, res) {
          expect(err).to.equal(error);
          done();
          });
        });

    it('should have the correct query include for articles', function(done) {
        rmw = function (query, rate, cb) {
        expect(query.include.length).to.equal(2);
        expect(query.include[0]).to.deep.equal({
relation: 'subarticles',
scope: {
limit: res.subarticle.views.mean,
order: 'rating DESC'
}
});
        expect(query.include[1]).to.deep.equal({
relation: 'comments',
scope: {
limit: res.comment.views.mean,
order: 'rating DESC'
}
});
        cb();
        };

        prep(app.models.article);
    update(done);
    });

it('should have the correct query include for subarticles', function(done) {
    rmw = function (query, rate, cb) {
    expect(query.include.length).to.equal(1);
    expect(query.include[0]).to.deep.equal({
relation: 'comments',
scope: {
limit: res.comment.views.mean,
order: 'rating DESC'
}
});
    cb();
    };

    prep(app.models.subarticle);
    type = 'subarticle';

    update(done);
    });

it('should have the correct query include for comments', function(done) {
    rmw = function (query, rate, cb) {
    expect(query.include.length).to.equal(1);
    expect(query.include[0]).to.deep.equal({
relation: 'comments',
scope: {
limit: res.comment.views.mean,
order: 'rating DESC'
}
});
    cb();
    };

    prep(app.models.comment);
    type = 'comment';

    update(done);
    });
});
});
});
});
*/

    describe('triggerRating', function() {
      var where, modify, prep, trigger;
      beforeEach(function() {
        where = {
          id: 123
        };
        modify = 'mod';
        cb = 'callback';

        prep = function(Model) {
          trigger = sandbox.stub(Model, 'triggerRating', function (Where, Modify, CB) {
            expect(Where).to.deep.equal(where);
            expect(Modify).to.deep.equal(modify);
            expect(CB).to.deep.equal(cb);
          });
        };
      });

      it('should return a 400 error code because the given model is unknown', function(done) {
        Stat.triggerRating(where, 'notAModel', modify, function (err, res) {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should call Article.triggerRating', function () {
        prep(app.models.article);
        Stat.triggerRating(where, 'article', modify, cb);
        expect(trigger.calledOnce).to.be.true;
      });

      it('should call Subarticle.triggerRating', function () {
        prep(app.models.subarticle);
        Stat.triggerRating(where, 'subarticle', modify, cb);
        expect(trigger.calledOnce).to.be.true;
      });

      it('should call Comment.triggerRating', function () {
        prep(app.models.comment);
        Stat.triggerRating(where, 'comment', modify, cb);
        expect(trigger.calledOnce).to.be.true;
      });

      it('should return a 400 error because there is no triggerRating function on upVote', function (done) {
        Stat.triggerRating(where, 'upVote', modify, function(err) {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });
};
