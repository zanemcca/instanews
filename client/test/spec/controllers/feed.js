
describe('Feed: ', function(){

  var deferred;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {

    module('instanews.feed');

    module(function($provide) {
      $provide.service('Navigate', function() {
        return {
          disableNextBack: function() {},
          onScroll: function() {
            return false;
          },
          scrollTop: function() {},
          toggleMenu: function() {}
        };
      });

      $provide.service('Article', function() {
        return {
          find: function(filter) {
          },
        };
      });

      $provide.service('Maps', function() {
        return {
          getFeedMap: function() {
            return {};
          },
          localize: function() {
          }
        };
      });

      $provide.service('Position', function() {
        return {
          registerObserver: function(cb) {
          },
          getBounds: function() {
            return new google.maps.LatLngBounds(
              new google.maps.LatLng(33.671068, -116.25128),
              new google.maps.LatLng(33.685282, -116.233942)
            );
          },
          registerBoundsObserver: function(cb) {
          }
        };
      });

      $provide.service('Articles', function() {
        return {
          get: function() {
            return [];
          },
          set: function(articles) {
          },
          getOne: function(articles) {
          },
          registerObserver: function(cb) {
          }
        };
      });
    });
  });

  // Inject the controller and initialize any dependencies we need
  beforeEach(inject(function(
    $controller, 
    $rootScope,
    Article,
    Maps,
    Position,
    Articles,
    Navigate
  ){
    scope = $rootScope.$new(); 
    article = Article;
    maps = Maps;
    position = Position;
    articles = Articles;
    navigate = Navigate;
    ctrl = $controller;

  }));

  //Do not forget to call me on the final before(Each) call
  var initController = function() {
    var controller = ctrl('FeedCtrl', {
      $scope: scope,
      Article: article,
      Maps: maps,
      Position: position,
      Articles: articles,
      Navigate: navigate
    });

    scope.$digest();
    return controller;
  };

  describe('initialization', function() {

    it('should call Articles.get', function() {
      sinon.spy(articles, 'get');
      initController();

      expect(articles.get.calledOnce).to.be.true;
    });

    it('should call Articles.registerObserver', function() {
      sinon.spy(articles, 'registerObserver');
      initController();

      expect(articles.registerObserver.calledOnce).to.be.true;
    });

    it('should call Position.registerObserver', function() {
      sinon.spy(position, 'registerObserver');
      initController();

      expect(position.registerObserver.calledOnce).to.be.true;
    });

    it('should call Position.registerBoundsObserver', function() {
      sinon.spy(position, 'registerBoundsObserver');
      initController();

      expect(position.registerBoundsObserver.calledOnce).to.be.true;
    });

    /*
    it('should initialize scope.scroll', function() {
      initController();

      expect(scope.scroll).to.exist;
      expect(scope.scroll.buttonOn).to.be.false;
    });
   */

    it('should initialize scope.itemsAvailable', function() {
      initController();

      expect(scope.itemsAvailable).to.be.true;
    });

    it('should set a local copy of toggleMenu and scrollTop', function() {
      initController();

      expect(scope.toggleMenu).to.exist;
      expect(scope.scrollTop).to.exist;
    });
  });

  /*
  describe('reload', function() {

    beforeEach( function() {
      //CAUTION: This works under the assumption that Postion.registerBoundsObserver
      //is being called only once during initialization with the reload function given
      //as the callback function
      sinon.stub(position, 'registerBoundsObserver', function(cb) {
        //TODO This SOB will not call the private functions because the 
        //stub is not within the same scope. So basically we have to make this an integration
        //test
        load = function(callback) {
          callback()
        };
        cb();
      });

    });

    it('should call Position.getBounds', function() {
      sinon.spy(position, 'getBounds');

      initController();

      expect(position.getBounds.calledOnce).to.be.true;
    });
  });

 //TODO For the same reason as the above we need to make the map updating an integration test
 */

  describe('localize' , function() {

    beforeEach( function() {
      sinon.stub(maps, 'getFeedMap', function() {
        return {};
      });

      sinon.stub(maps, 'localize', function() {
      });

      controller = initController();
    });

    it('should call Maps.getFeedMap and Maps.localize once each', function() {
      scope.localize();

      expect(maps.getFeedMap.calledOnce).to.be.true;
      expect(maps.localize.calledOnce).to.be.true;
    });
  });

  /*
  describe('onScroll', function() {
    beforeEach( function() {
      sinon.stub(navigate, 'onScroll', function() {
        return false;
      });

      controller = initController();
    });

    it('should set buttonOn to false and call Navigate.onScroll once', function() {
      scope.scroll.buttonOn = true;
      
      scope.onScroll();

      expect(navigate.onScroll.calledOnce).to.be.true;
      expect(scope.scroll.buttonOn).to.be.false;
    });
  });
 */

  describe('load callers', function() {

    var arts = [];
    
    beforeEach( function() {

      sinon.stub(articles, 'set', function(arts) {
      });

      sinon.stub(article, 'find', function(filter) {
        return {
          $promise: {
            then: function(cb) {
              cb(arts);
            }
          }
        }
      });

      controller = initController();
    });

    describe('onRefresh', function() {

      beforeEach(function() { 
        sinon.stub(articles, 'getOne', function(id) {
          return false;
        });

        sinon.stub(scope, '$broadcast', function(signal) {
          expect(signal).to.equal('scroll.refreshComplete');
        });
      });

      it('should call Article.find', function() {
        scope.onRefresh();

        expect(article.find.calledOnce).to.be.true;
      });

      it('should send a broadcast', function() {
        scope.onRefresh();
        expect(scope.$broadcast.calledOnce).to.be.true;
      });

      it('should set itemsAvailable to false', function() {
        arts = [];

        scope.onRefresh();
        
        expect(scope.itemsAvailable).to.be.false;
      });

      it('should set scope.itemsAvailable to true', function() {
        arts = [
          {
            id: '1',
            subarticles: []
          }
        ];

        scope.onRefresh();

        expect(scope.itemsAvailable).to.be.true;
      });

      it('should call Articles.set twice', function() {
        arts = [
          {
            id: '1',
            subarticles: []
          }
        ];

        scope.onRefresh();

        expect(articles.set.calledTwice).to.be.true;
      });

      it('should get 5 articles', function() {
        arts = [
          {
            id: '1',
            subarticles: []
          },
          {
            id: '2',
            subarticles: []
          },
          {
            id: '3',
            subarticles: []
          },
          {
            id: '4',
            subarticles: []
          },
          {
            id: '5',
            subarticles: []
          }
        ];

        scope.onRefresh();

        expect(articles.getOne.callCount).to.equal(5);
        expect(scope.articles.length).to.equal(5);
      }); 

      it('should set the topSub of the article', function() {
        arts = [
          {
            id: '1',
            subarticles: [
              {
                id: 's1'
              },
              {
                id: 's2'
              }
            ]
          }
        ];

        scope.onRefresh();

        expect(scope.articles.length).to.equal(1);
        expect(scope.articles[0].topSub).to.exist;
        expect(scope.articles[0].topSub.id).to.equal('s1');
      });
    });

    describe('loadMore', function() {

      beforeEach(function() {
        sinon.stub(scope, '$broadcast', function(signal) {
          expect(signal).to.equal('scroll.infiniteScrollComplete');
        });
      });

      it('should broadcast scroll.infiniteScrollComplete', function() {

        scope.loadMore();

        expect(scope.$broadcast.calledOnce).to.be.true;
      });

      it('should remove the duplicate article', function() {

        sinon.stub(articles, 'getOne', function(id) {
          return true;
        });

        arts = [
          {
            id: '1',
            subarticles: []
          }
        ];

        scope.loadMore();

        expect(articles.getOne.callCount).to.equal(1);
        expect(scope.articles.length).to.equal(0);
      }); 

      it('should append the arts to scope.articles', function() {

        scope.articles = [
          {
            id: '1',
            subarticles: []
          }
        ];

        arts = [
          {
            id: '2',
            subarticles: []
          }
        ];

        scope.loadMore();

        expect(scope.articles.length).to.equal(2);
        expect(scope.articles[1]).to.equal(arts[0]);
      }); 
    });
  });

  describe('$scope.$on ionicView.afterEnter', function() {
    beforeEach(function() {
      sinon.spy(maps, 'getFeedMap');

      controller = initController();
    });

    it('should get the feedMap', function() {
      scope.$broadcast('$ionicView.afterEnter');

      expect(maps.getFeedMap.calledOnce).to.be.true;
    });

    it('should send a resize trigger to google maps', function() {
      sinon.stub(google.maps.event, 'trigger', function(map, signal){
        expect(signal).to.equal('resize');
      });

      scope.$broadcast('$ionicView.afterEnter');

      expect(google.maps.event.trigger.calledOnce).to.be.true;
    });
  });

});
