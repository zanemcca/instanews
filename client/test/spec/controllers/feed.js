
describe('Feed: ', function(){

  var deferred;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {

    module('instanews.controller.feed');

    module(function($provide) {
      $provide.service('Navigate', function() {
        return function (spec) {
          return {
            disableNextBack: function() {},
            onScroll: function() {
              return false;
            },
            scrollTop: function() {},
            toggleMenu: function() {}
          };
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
          updateHeatmap: function(articles) {},
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
          boundsReady: {
            then: function (cb) {
              cb();
            }
          },
          registerBoundsObserver: function(cb) {
          }
        };
      });

      $provide.service('Platform', function() {
        return {
          showSheet: function(sheet) {},
          getAppNameLogo: function () {
            return 'logoname';
          },
          showToast: function(message) {}
        }
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
    Article,
    Maps,
    Position,
    Platform,
    Articles,
    Navigate
  ){
    scope = $rootScope.$new(); 
    article = Article;
    maps = Maps;
    position = Position;
    platform = Platform;
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
      Platform: platform,
      Articles: articles,
      Navigate: navigate
    });

    scope.$digest();
    return controller;
  };

  describe('initialization', function() {

    it('should set $scope.Articles to Articles', function() {
      initController();

      expect(scope.Articles).to.deep.equal(articles);
    });

    // Not needed with new list service
    it.skip('should call Articles.registerObserver', function() {
      sinon.spy(articles, 'registerObserver');
      initController();

      expect(articles.registerObserver.calledOnce).to.be.true;
    });

    // Not needed with new list service
    it.skip('should set a local copy of areItemsAvailable', function() {
      sinon.spy(articles, 'areItemsAvailable');
      initController();

      scope.itemsAvailable();
      expect(articles.areItemsAvailable.calledOnce).to.be.true;
    });

    it('should set a local copy of toggleMenu', function() {
      initController();

      expect(scope.toggleMenu).to.exist;
    });
  });

  // Not needed with new list service
  describe.skip('updateArticles', function() {
    beforeEach( function() {
      //NOTE: I am forcing registerObserver to call the cb which should
      //be updateArticles
      sinon.stub(articles, 'registerObserver', function(cb) {
        cb();
      });

      sinon.spy(articles, 'get');

      initController();
    });

    it('should call Articles.get', function() {
      expect(articles.get.calledTwice).to.be.true;
    });
  });

  //TODO Move this to autocomplete
  /*
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
     */

  // Not needed with new list service
  describe.skip('load callers', function() {

    var arts = [];

    beforeEach( function() {
      controller = initController();

      sinon.spy(articles, 'add');
      sinon.spy(articles, 'deleteAll');
      sinon.spy(articles, 'load');
      sinon.spy(articles, 'areItemsAvailable');
      sinon.stub(articles, 'get', function() {
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

      it('should call Articles.load', function() {
        scope.onRefresh();

        expect(articles.load.calledOnce).to.be.true;
      });

      it('should send a broadcast', function() {
        scope.onRefresh();
        expect(scope.$broadcast.calledOnce).to.be.true;
      });

      it('should call Articles.deleteAll once', function() {
        arts = [];

        scope.onRefresh();

        expect(articles.deleteAll.calledOnce).to.be.true;
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
