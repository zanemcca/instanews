      
"use strict";

describe('Subarticles service', function() {

  beforeEach(function() {

    module('instanews.service.subarticles');

    module(function($provide) {
      $provide.service('Article', function() {
        return {
          subarticles: function(req) {
            return {
              $promise: {
                then: function(cb, err) {
                  cb([{
                    id: '1'
                  },
                  {
                    id: '2'
                  }]);
                }
              }
            };
          }
        };
      });
    });
  });

  beforeEach(inject(function(Article, Subarticles) {
    article = Article;
    subarticles = Subarticles;
  }));

  describe('initialization', function() {
    it('should initialize subarticles to an empty array', function() {
      expect(subarticles.get()).to.be.empty;
    });

    it('should initialize itemsAvailable to true', function() {
      expect(subarticles.areItemsAvailable()).to.be.true;
    });

    it('should initialize the filter', function() {
      sinon.stub(article, 'subarticles', function(f) {
        expect(f.filter.limit).to.equal(50);
        expect(f.filter.skip).to.equal(0);
        expect(f.filter.order).to.equal('rating DESC');

        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      subarticles.load('id', function() {});
      expect(article.subarticles.calledOnce).to.be.true;
    });
  });

  describe('get' , function() {
    it('should return an empty array', function() {
      expect(subarticles.get()).to.be.empty;
    });

    it('should return an array with two elements', function() {
      subarticles.load('id', function() {});
      expect(subarticles.get().length).to.equal(2);
    });
  });
  
  describe('load', function() {
    it('should add the subarticles', function() {
      subarticles.load('id', function() {});
      expect(subarticles.get().length).to.equal(2);
    });

    it('should set itemsAvailable to false', function() {
      sinon.stub(article, 'subarticles', function(f) {
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      subarticles.load('id', function() {});

      expect(subarticles.areItemsAvailable()).to.be.false;
    });

    it('should call the passed in callback', function() {
      var fake = {
        func: function () {}
      };

      sinon.spy(fake, 'func');

      subarticles.load('id', fake.func);
      expect(fake.func.calledOnce).to.be.true;
    });

    it('should update the filter.skip', function() {
      var skip = 0;
      sinon.stub(article, 'subarticles', function(f) {
        expect(f.filter.skip).to.equal(skip);
        return {
          $promise: {
            then: function(cb) {
              skip += 2;
              cb([{
                id: '1'
              },
              {
                id: '2'
              }]);
            }
          }
        }
      });

      subarticles.load('id', function() {});
      subarticles.load('id', function() {});

      expect(article.subarticles.calledTwice).to.be.true;
    });

    it('should remove duplicates', function() {
      sinon.spy(article,'subarticles');

      subarticles.load('id', function() {});
      subarticles.load('id', function() {});
      expect(article.subarticles.calledTwice).to.be.true;
      expect(subarticles.get().length).to.equal(2);
    });
  });

  describe('deleteAll', function() {
    it('should delete all subarticles', function() {
      subarticles.load('id', function() {});
      expect(subarticles.get().length).to.equal(2);
      subarticles.deleteAll();
      expect(subarticles.get()).to.be.empty;
    });

    it('should clear filter.skip', function() {
      sinon.stub(article, 'subarticles', function(f) {
        expect(f.filter.skip).to.equal(0);
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      subarticles.deleteAll();

      subarticles.load('id', function() {});
      expect(article.subarticles.calledOnce).to.be.true;
    });

    it('should notify observers', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      subarticles.registerObserver(fake.func);

      subarticles.deleteAll();
      expect(fake.func.calledOnce).to.be.true;
    });
    
    it('should set items available to true', function() {
      sinon.stub(article, 'subarticles', function(f) {
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      subarticles.load('id', function() {});
      expect(subarticles.areItemsAvailable()).to.be.false;
      subarticles.deleteAll();

      expect(subarticles.areItemsAvailable()).to.be.true;
    });
  });

  describe('areItemsAvailable', function() {
    it('should return true', function() {
      expect(subarticles.areItemsAvailable()).to.be.true;
    });

    it('should return false', function() {
      sinon.stub(article, 'subarticles', function(f) {
        return {
          $promise: {
            then: function(cb) {
              cb([]);
            }
          }
        }
      });

      subarticles.load('id', function() {});
      expect(subarticles.areItemsAvailable()).to.be.false;
    });
  });

  describe('registerObserver', function() {
    it('should be notified', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      subarticles.registerObserver(fake.func);

      subarticles.load('id', function() {});
      expect(fake.func.calledOnce).to.be.true;
    });
  });

  describe('unregisterObserver', function() {
    it('should not be notified', function() {
      var fake = {
        func: function() {}
      };
      sinon.spy(fake, 'func');
      subarticles.registerObserver(fake.func);
      subarticles.unregisterObserver(fake.func);

      subarticles.load('id', function() {});
      expect(fake.func.callCount).to.equal(0);
    });
  });
});
