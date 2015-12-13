
describe('Article controller: ', function(){

  var deferred;
  var art;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {
    art = {
      location: {
        lat: 45,
        lng: 45
      }
    };

    module('instanews.controller.article');

    module(function($provide) {

      $provide.service('Article', function() {
        return {
          find: function(filter) {
            return art;
          },
        };
      });

      $provide.service('$ionicModal', function($q) {
        return {
          fromTemplateUrl: function(uri, obj) {
            deferred = $q.defer()
            return deferred.promise;
          }
        };
      });

      $provide.service('Post', function() {
        return {
          post: function(uploads, cb) {
            cb();
          },
        };
      });

      $provide.service('Platform', function() {
        return {
          isIOS: function() {
            return true;
          },
        };
      });

      $provide.service('Uploads', function() {
        return {
          findOrCreate: function(id) {
            return {
              get: function() {
                return uploads;
              },
              registerObserver: function (cb) {
                return {
                  unregister: function () {
                    cb();
                  }
                };
              }
            };
          }
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
          unregisterObserver: function() {},
          findOrCreate: function () {
            return {
              getSpec: function () {
                return { 
                  options: {
                    filter: {}
                  }
                };
              },
              load: function () {
              }
            };
          },
          getSpec: function () {},
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
          findById: function(articles) {
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

      $provide.service('Navigate', function() {
        return {
        };
      });
    });
  });

  // Inject the controller and initialize any dependencies we need
  beforeEach(inject(function(
    $controller, 
    $rootScope,
    $stateParams,
    $ionicModal,
    Article,
    Articles,
    Subarticles,
    Post,
    Platform,
    Uploads,
    Maps
  ){
    scope = $rootScope.$new(); 
    stateParams = $stateParams;
    ionicModal = $ionicModal;
    article = Article;
    maps = Maps;
    subarticles = Subarticles;
    articles = Articles;
    uploads = Uploads;
    ctrl = $controller;
  }));

  //Do not forget to call me on the final before(Each) call
  var initController = function() {
    var controller = ctrl('ArticleCtrl', {
      $scope: scope,
      $stateParams: stateParams,
      $ionicModal: ionicModal,
      Article: article,
      Articles: articles,
      Subarticles: subarticles,
      Uploads: uploads,
      Maps: maps,
    });

    scope.$digest();
    return controller;
  };

  describe('initialization: ', function() {
    it('should call Articles.findById', function() {
      sinon.stub(articles, 'findById', function(id) {
        expect(id).to.equal(stateParams.id);
      });

      initController();

      expect(articles.findById.calledOnce).to.be.true;
    });

    // This is not necessary using the new list
    it.skip('should call Subarticles.registerObserver', function() {
      sinon.spy(subarticles, 'registerObserver');
      sinon.spy(subarticles, 'get');

      initController();

      expect(subarticles.registerObserver.calledOnce).to.be.true;
      expect(subarticles.get.calledOnce).to.be.true;
    });

    // This is irrelevant under the new list servic
    it.skip('should call updateSubarticles when Subarticles updates', function() {
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
      scope.article = {
        location: {
          lat: 45,
          lng: -64
        }
      };
      scope.$broadcast('$ionicView.afterEnter');
    });

    it('should call Maps.deleteMarker', function() {
      sinon.spy(maps, 'deleteMarker');
      scope.$broadcast('$ionicView.afterLeave');
      expect(maps.deleteMarker.calledOnce).to.be.true;
    });

    // Not needed with new list structure
    it.skip('should call Subarticles.unregisterObserver', function() {
      sinon.spy(subarticles, 'unregisterObserver');
      scope.$broadcast('$ionicView.afterLeave');
      expect(subarticles.unregisterObserver.calledOnce).to.be.true;
    });

    // Not needed with new list structure
    it.skip('should call Subarticles.deleteAll', function() {
      sinon.spy(subarticles, 'deleteAll');
      scope.$broadcast('$ionicView.afterLeave');
      expect(subarticles.deleteAll.calledOnce).to.be.true;
    });
  });

  // OnRefresh is disabled for now
  describe.skip('onRefresh', function() {
    // Not needed with new list structure
    it.skip('should call Subarticles.deleteAll', function() {
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

  // This is done internally in the list service
  describe.skip('loadMore', function() {
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
