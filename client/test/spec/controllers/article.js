
describe('Article controller: ', function(){

  var deferred;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {

    module('instanews.article');

    module(function($provide) {

      $provide.service('Article', function() {
        return {
          find: function(filter) {
          },
        };
      });

      $provide.service('Subarticles', function() {
        return {
          load: function(id, cb) {
            cb();
          },
          registerObserver: function(cb) {
            cb();
          },
          deleteAll: function() {},
          get: function(id) {
            return [1,2,3];
          }
        };
      });

      $provide.service('Maps', function() {
        return {
          getArticleMap: function() {
            return {
              map: 'I am map'
            };
          },
          setMarker: function(map, position) {
            return {
              name: 'marker'
            };
          },
          deleteMarker: function(marker) {},
          localize: function() {
          }
        };
      });

      $provide.service('Articles', function() {
        return {
          get: function() {
            return [];
          },
          add: function(articles) {
          },
          getOne: function(articles) {
          },
          deleteAll: function() {},
          areItemsAvailable: function() {
            return true;
          },
          load: function(cb) {
            cb();
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
    $stateParams,
    Article,
    Articles,
    Subarticles,
    Maps
  ){
    scope = $rootScope.$new(); 
    stateParams = $stateParams;
    article = Article;
    maps = Maps;
    subarticles = Subarticles;
    articles = Articles;
    ctrl = $controller;
  }));

  //Do not forget to call me on the final before(Each) call
  var initController = function() {
    var controller = ctrl('ArticleCtrl', {
      $scope: scope,
      $stateParams: stateParams,
      Article: article,
      Articles: articles,
      Subarticles: subarticles,
      Maps: maps,
    });

    scope.$digest();
    return controller;
  };

  describe('initialization: ', function() {
    it('should call Articles.getOne', function() {
      sinon.stub(articles, 'getOne', function(id) {
        expect(id).to.equal(stateParams.id);
      });

      initController();

      expect(articles.getOne.calledOnce).to.be.true;
    });

    it('should call Subarticles.registerObserver', function() {
      sinon.spy(subarticles, 'registerObserver');
      sinon.spy(subarticles, 'get');

      initController();

      expect(subarticles.registerObserver.calledOnce).to.be.true;
      expect(subarticles.get.calledOnce).to.be.true;
    });

    it('should call updateSubarticles when Subarticles updates', function() {
      sinon.spy(subarticles, 'get');

      initController();

      expect(subarticles.get.calledOnce).to.be.true;
      expect(scope.subarticles.length).to.equal(3);
      expect(scope.subarticles[0]).to.equal(1);
      expect(scope.subarticles[1]).to.equal(2);
      expect(scope.subarticles[2]).to.equal(3);
    });
  });

  describe('on $ionicView.afterEnter', function() {
    beforeEach(function() {
      initController();
      scope.article = {
        location: {
          lat: 45,
          lng: -64
        }
      };
    });

    it('should call Maps.getArticleMap', function() {
      sinon.spy(maps, 'getArticleMap');
      scope.$broadcast('$ionicView.afterEnter');
      expect(maps.getArticleMap.calledOnce).to.be.true;
    });

    it('should call Maps.setMarker', function() {
      sinon.spy(maps, 'setMarker');
      scope.$broadcast('$ionicView.afterEnter');
      expect(maps.setMarker.calledOnce).to.be.true;
    });
  });

  describe('on $ionicView.afterLeave', function() {
    beforeEach(function() {
      initController();
    });

    it('should call Maps.deleteMarker', function() {
      sinon.spy(maps, 'deleteMarker');
      scope.$broadcast('$ionicView.afterLeave');
      expect(maps.deleteMarker.calledOnce).to.be.true;
    });
  });

  describe('onRefresh', function() {
    it('should call Subarticles.deleteAll', function() {
      initController();
      sinon.spy(subarticles, 'deleteAll');
      scope.onRefresh();
      expect(subarticles.deleteAll.calledOnce).to.be.true;
    });

    it('should call Subarticles.load', function() {
      initController();
      sinon.spy(subarticles, 'load');
      sinon.stub(scope, '$broadcast', function(event) {
        expect(event).to.equal('scroll.refreshComplete');
      });

      scope.onRefresh();
      expect(subarticles.load.calledOnce).to.be.true;
      expect(scope.$broadcast.calledOnce).to.be.true;
    });
  });

  describe('loadMore', function() {
    it('should call Subarticles.load', function() {
      initController();
      sinon.spy(subarticles, 'load');
      sinon.stub(scope, '$broadcast', function(event) {
        expect(event).to.equal('scroll.infiniteScrollComplete');
      });

      scope.loadMore();
      expect(subarticles.load.calledOnce).to.be.true;
      expect(scope.$broadcast.calledOnce).to.be.true;
    });
  });
});
