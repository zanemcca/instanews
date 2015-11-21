
"use strict";

describe('Articles', function() {

  var list;
  var arts;
  var Spec;
  beforeEach(function() {
    arts = [];
    list = {
      load: function () {},
      get: function () {}
    };

    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(33.671068, -116.25128),
      new google.maps.LatLng(33.685282, -116.233942));

      module('instanews.service.articles');

      module(function($provide ) {
        $provide.service('Article', function() {
          return {
            find: function(filter) {
              return { 
                $promise: {
                  then: function (cb) {
                    cb(arts);
                  }
                }
              };
            }
          };
        });

        $provide.service('Position', function() {
          return {
            registerBoundsObserver: function(cb) {
              cb();
            },
            getBounds : function() {
              return bounds;
            },
            posToLatLng : function(location) {
              return {}
            },
            withinBounds : function(position) {
              return true;
            }
          };
        });

        $provide.service('Subarticles', function() {
          return {
            loadBest : function(id, cb) {
              cb('sub');
            }
          };
        });

        $provide.service('list', function() {
          var listCreate = function (spec) {
            Spec = spec;
            return list;
          };
          return listCreate; 
        });

        $provide.service('Platform', function() {
          return {
            ready: {
              then: function(cb) {
                cb();
              }
            },
            loading: {
              show: function() {},
              hide: function () {}
            }
          };
        });
      });
  });

  var articles, article, List, subarticle, position;

  beforeEach(inject(function($filter, Article, Subarticles, list, Position, Articles) {
    articles = Articles;
    article = Article;
    List  = {
      list: list
    };
    subarticles = Subarticles;
    position = Position;
  }));

  //TODO Move this test into list
  describe.skip('areItemsAvailable', function() {
    it('should return true', function() {
      arts = [1];
      articles.updateBounds();
      expect(articles.areItemsAvailable()).to.be.true;
    });
  });

  //TODO Repair this one
  describe.skip('updateBounds', function() {
    it('should set the filter bounds', function() {
      /*
      sinon.stub(article, 'find', function(f) {
        expect(f.filter.where).to.exist;
        expect(f.filter.where.location.geoWithin.$box).to.exist;
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      articles.load(function() {});
      expect(article.find.calledOnce).to.be.true;
     */
      expect(Spec.options.filter.where.location.geoWithin.$box).to.exist;
    });

  });

  //TODO Take most of this and move it to list
  //TODO Fix the rest
  describe.skip('add' , function() {
    describe('addOne', function() {
      var arts = [];
      var date;
      beforeEach(function() {
        arts = [
          {
            id: '1',
            rating: 0,
            modified: Date.now(),
            subarticles: [
              {
                id: 'a'
              }
            ]
          }
        ];

        sinon.spy(position, 'withinBounds');
        articles.add(arts);
      });

      it('should call withinBounds once', function() {
        expect(position.withinBounds.calledOnce).to.be.true;
      });

      it('should have saved one article in inViewArticles', function() {
        var results = articles.get();
        expect(results.length).to.equal(1);
        expect(results[0].id).to.equal(arts[0].id);
      });

      it('should set the topSub', function() {
        var results = articles.get();
        expect(results[0].topSub.id).to.equal(arts[0].subarticles[0].id);
      });

      it('should not replace the article because the stored one is newer', function() {
        var rating = arts[0].rating;

        arts = [
          {
            id: '1',
            rating: 1,
            modified: Date(2000,1,1),
            subarticles: [
              {
                id: 'a'
              }
            ]
          }
        ];

        articles.add(arts);
        var results = articles.get();
        expect(results.length).to.equal(1);
        expect(results[0].rating).to.equal(rating);
      });

      it('should replace the article because it is newer', function() {
        arts = [
          {
            id: '1',
            rating: 1,
            modified: Date.now(),
            subarticles: [
              {
                id: 'a'
              }
            ]
          }
        ];

        articles.add(arts);
        var results = articles.get();
        expect(results.length).to.equal(1);
        expect(results[0].rating).to.equal(arts[0].rating);
      });

      it('should add the article in order by rating', function() {
        var moreArticles = [
          {
            id: '2',
            rating: 0.8,
            subarticles: [
              {
                id: 'a'
              }
            ]
          }
        ];

        articles.add(moreArticles);

        var results = articles.get();
        expect(results.length).to.equal(2);
        expect(results[0].id).to.equal(moreArticles[0].id);
        expect(results[1].id).to.equal(arts[0].id);
      });
    });

    it('should add more than one article', function() {
      var arts = [
        {
          id: '1',
          rating: 0,
          subarticles: []
        },
        {
          id: '2',
          rating: 0,
          subarticles: []
        }
      ];

      articles.add(arts);

      var results = articles.get();
      expect(results.length).to.equal(2);
      expect(results[0].id).to.equal(arts[0].id);
      expect(results[1].id).to.equal(arts[1].id);
    });

    it('should add an article to outViewArticles', function() {
      sinon.stub(position, 'withinBounds', function(position) {
        return false;
      });

      var arts = [
        {
          id: '1',
          rating: 0,
          subarticles: []
        },
        {
          id: '2',
          rating: 0,
          subarticles: []
        }
      ];

      articles.add(arts);
      var results = articles.get();
      expect(results.length).to.equal(0);
    });

    it('should notify observers', function(done) {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      articles.registerObserver(fake.func);

      articles.add([1], function () {
        expect(fake.func.calledOnce).to.be.true;
        done();
      })
    });

    it('should update the filter.skip', function() {
      var arts = [
        {
          id: '1',
          rating: 0,
          subarticles: []
        },
        {
          id: '2',
          rating: 0,
          subarticles: []
        }
      ];

      sinon.stub(article, 'find', function(f) {
        expect(f.filter.skip).to.equal(arts.length);
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      articles.add(arts);
      articles.load(function() {});
      expect(article.find.calledOnce).to.be.true;
    });
  });

  //TODO move this to list
  describe.skip('get' , function() {
    it('should return an empty array', function() {
      var arts = articles.get();
      expect(arts.length).to.equal(0);
    });
  });

  //TODO Move this to list
  describe.skip('load', function() {
    var arts = [];
    beforeEach(function() {
      arts = [
        {
          id: '1',
          rating: 0,
          subarticles: []
        },
        {
          id: '2',
          rating: 0,
          subarticles: []
        }
      ];

      sinon.stub(article, 'find', function(f) {
        return {
          $promise: {
            then: function(cb) {
              cb(arts);
            }
          }
        }
      });
    });

    it('should add the articles', function() {

      articles.load( function() {});
      var results = articles.get(); 
      expect(results.length).to.equal(2);
    });

    it('should set itemsAvailable to false', function() {
      arts = [];

      articles.load( function() {});

      expect(articles.areItemsAvailable()).to.be.false;
    });

    it('should call the passed in callback', function() {
      var fake = {
        func: function () {}
      };

      sinon.spy(fake, 'func');

      articles.load(fake.func);
      expect(fake.func.calledOnce).to.be.true;
    });
  });

  //TODO Move this to list
  describe.skip('deleteAll', function() {
    var arts = [];
    beforeEach( function() {
      arts = [
        {
          id: '1',
          rating: 0,
          subarticles: []
        },
        {
          id: '2',
          rating: 0,
          subarticles: []
        }
      ];

      articles.add(arts);
      var results = articles.get();
      expect(results.length).to.equal(arts.length);
    });

    it('should delete all articles in inViewArticles', function() {
      articles.deleteAll();
      var results = articles.get();
      expect(results.length).to.equal(0);
    });

    it('should clear filter.skip', function() {

      sinon.stub(article, 'find', function(f) {
        expect(f.filter.skip).to.equal(0);
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      articles.deleteAll();

      articles.load(function() {});
      expect(article.find.calledOnce).to.be.true;
    });

    it('should notify observers', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      articles.registerObserver(fake.func);

      articles.deleteAll();
      expect(fake.func.calledOnce).to.be.true;
    });
  });

  //TODO MOve this to list
  describe.skip('getOne', function() {
    var arts = [];
    beforeEach( function() {
      arts = [
        {
          id: '1',
          rating: 0,
          subarticles: []
        },
        {
          id: '2',
          rating: 0,
          subarticles: []
        }
      ];
      articles.add(arts);

      sinon.stub(position, 'withinBounds', function(pos) {
        return false;
      });

      arts = [
        {
          id: '3',
          subarticles: []
        }
      ];

      articles.add(arts);
    });

    it('should return an article from inViewArticles', function() {
      var art = articles.getOne('1');

      expect(art).to.exist;
      expect(art.id).to.equal('1');
    });

    it('should return an article from outViewArticles', function() {
      var art = articles.getOne('3');

      expect(art).to.exist;
      expect(art.id).to.equal('3');
    });
  });

  // This is no longer relevant with the new list
  describe.skip('registerObserver', function() {
    it('should be notified', function(done) {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      articles.registerObserver(fake.func);

      articles.add([1], function () {
        expect(fake.func.calledOnce).to.be.true;
        done();
      })
    });
  });

  // TODO This needs to be tested through updateBounds to keep it private
  describe.skip('reorganize', function() {
    var arts = [];
    var withinBounds = true;

    beforeEach( function() {
      sinon.stub(position, 'withinBounds', function(pos) {
        return withinBounds;
      });

      arts = [
        {
          id: '1',
          rating: 0.55,
          subarticles: []
        },
        {
          id: '2',
          rating: 0.88,
          subarticles: []
        }
      ];
      articles.add(arts);

      withinBounds = false;
      arts = [
        {
          id: '3',
          rating: 0.99,
          subarticles: []
        }
      ];

      articles.add(arts);
    });

    it('should move all articles into inViewArticles', function() {
      withinBounds = true;
      articles.reorganize();
      var results = articles.get();
      expect(results.length).to.equal(3);
    }); 

    it('should move all articles into outViewArticles', function() {
      withinBounds = false;
      articles.reorganize();
      var results = articles.get();
      expect(results.length).to.equal(0);
    }); 

    it('should call notifyObservers', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      articles.registerObserver(fake.func);

      articles.reorganize();
      expect(fake.func.calledOnce).to.be.true;
    });

    it('should update the filter.skip', function() {

      sinon.stub(article, 'find', function(f) {
        expect(f.filter.skip).to.equal(3);
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      withinBounds = true;
      articles.reorganize();

      articles.load(function() {});
      expect(article.find.calledOnce).to.be.true;
    });
  });
});
