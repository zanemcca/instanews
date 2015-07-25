
describe('Post: ', function(){

  var deferred;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {

    module('instanews.post');

    module(function($provide) {

      $provide.service('ENV', function() {
        return {
          apiEndpoint: 'http://localhost:3000/api'
        }
      });

      $provide.service('FileTransfer', function() {
        return {
          upload: function(server, filepath, options) {
            return {
              then: function(succ, err, prog) {
                succ();
              }
            }
          }
        }
      });

      $provide.service('Article', function() {
        return {
          find: function(filter) {
          },
          create: function(obj) {
            return {
              $promise:  {
                then: function(cb) {}
              }
            }
          },
          subarticles: {
            create: function(obj) {
              return {
                $promise:  {
                  then: function(cb) {
                    obj.id = 'abc';
                    cb(obj);
                  }
                }
              }
            }
          }
        };
      });

      $provide.service('User', function() {
        return {
          get: function() {},
          getToken: function() {},
          registerObserver: function(cb) {
            cb();
          }
        }
      });

      $provide.service('Camera', function() {
        return {
          getPicture: function() {
            return {
              then: function(cb) {
                cb('url');
              }
            }
          },
          getPictures: function(cb) {
            cb([1,2]);
          },
          getVideo: function() {
            return {
              then: function(cb) {
                cb([1]);
              }
            }
          }
        }
      });

      $provide.service('Storage', function() {
        return {
        }
      });

      $provide.service('$ionicModal', function() {
        return {
          fromTemplateUrl: function(file, obj) {
            return {
              then: function(cb) {
                cb();
              }
            }
          }
        }
      });

      $provide.service('$ionicHistory', function() {
        return {
          goBack: function() {}
        }
      });

      $provide.service('Maps', function() {
        return {
          getMarker: function() {},
          setMarker: function() {},
          getPostMap: function() {},
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
    $state,
    $stateParams,
    $ionicModal,
    $ionicHistory,
    Article,
    Articles,
    Position,
    Maps,
    User,
    Camera,
    rfc4122,
    FileTransfer,
    Storage
  ){
    ionicModal = $ionicModal;
    ionicHistory = $ionicHistory;
    state = $state;
    stateParams = $stateParams;
    article = Article;
    articles = Articles;
    position = Position;
    maps = Maps;
    user = User;
    camera = Camera;
    storage = Storage;
    Rfc4122 = rfc4122;
    fileTransfer = FileTransfer;
    ctrl = $controller;

  }));

  //Do not forget to call me on the final before(Each) call
  var initController = function() {
    var controller = ctrl('PostCtrl', {
      $state: state,
      $stateParams: stateParams,
      $scope: scope,
      $ionicModal: ionicModal,
      $ionicHistory: ionicHistory,
      Article: article,
      Articles: articles,
      Position: position,
      Maps: maps,
      User: user,
      Camera: camera,
      rfc4122: Rfc4122,
      FileTransfer: fileTransfer,
      Storage: storage
    });

    scope.$digest();
    return controller;
  };

  describe('Initialization', function() {

    it('should call User.get', function() {
      sinon.spy(user,'get');
      sinon.stub(user,'registerObserver', function(cb) {});

      initController();

      expect(user.get.calledOnce).to.be.true;
    });

    it('should register updateUser as a callback', function() {
      sinon.spy(user,'get');

      initController();

      expect(user.get.calledTwice).to.be.true;
    });

    it('should set getMarker to Maps.getMarker', function() {
      sinon.spy(maps, 'getMarker');
      initController();

      scope.getMarker();
      expect(maps.getMarker.calledOnce).to.be.true;
    });

    it('should localize on ionicView.afterEnter', function() {
      sinon.stub(scope, '$on', function(text, cb) {
        expect(text).to.equal('$ionicView.afterEnter');
        cb();
      });

      initController();

      expect(scope.$on.calledOnce).to.be.true;
    });

    it('should call Articles.getOne and set the local article', function() {
      stateParams.id = 'hello';

      var art = {
        id: stateParams.id
      };

      sinon.stub(articles, 'getOne', function(id) {
        expect(id).to.equal(stateParams.id);
        return art;
      });

      initController();

      expect(scope.article).to.exist;
      expect(scope.article.id).to.equal(art.id);
    });

    it('should setup the postTextModal', function() {
      sinon.stub(ionicModal, 'fromTemplateUrl', function(text, obj) {
        expect(text).to.equal('templates/postTextModal.html');
        return {
          then: function(cb) {
            cb(true);
          }
        }
      });

      initController();

      expect(ionicModal.fromTemplateUrl.calledOnce).to.be.true;
      expect(scope.postTextModal).to.be.true;
    });
  });

  describe('', function() {
    beforeEach(initController);

    describe('localize', function() {
      it('should call getPostMap', function() {
        sinon.spy(maps, 'getPostMap');
        scope.localize();
        expect(maps.getPostMap.calledOnce).to.be.true;
      });

      it('should not call Maps.localize', function() {
        sinon.stub(maps, 'getPostMap', function() {
          return false;
        });
        sinon.spy(maps, 'localize');
        scope.localize();

        expect(maps.getPostMap.calledOnce).to.be.true;
        expect(maps.localize.callCount).to.equal(0);
      });

      it('should call Maps.localize', function() {
        sinon.stub(maps, 'getPostMap', function() {
          return true;
        });
        sinon.spy(maps, 'localize');
        scope.localize();

        expect(maps.getPostMap.calledOnce).to.be.true;
        expect(maps.localize.calledOnce).to.be.true;
      });

      it('should call Maps.setMarker', function() {
        sinon.stub(maps, 'getPostMap', function() {
          return true;
        });
        sinon.stub(maps, 'localize', function(map, cb) {
          cb(null,true);
        });
        sinon.spy(maps, 'setMarker');

        scope.localize();

        expect(maps.getPostMap.calledOnce).to.be.true;
        expect(maps.localize.calledOnce).to.be.true;
        expect(maps.setMarker.calledOnce).to.be.true;
      });

      it('should not call Maps.setMarker', function() {
        sinon.stub(maps, 'getPostMap', function() {
          return true;
        });
        sinon.stub(maps, 'localize', function(map, cb) {
          cb(true,true);
        });
        sinon.spy(maps, 'setMarker');

        scope.localize();

        expect(maps.getPostMap.calledOnce).to.be.true;
        expect(maps.localize.calledOnce).to.be.true;
        expect(maps.setMarker.callCount).to.equal(0);
      });
    });

    describe('trashArticle', function() {

      it('should reset newArticle', function() {
        scope.newArticle = {
          title: 'title',
          data: [1,2,3]
        };

        scope.trashArticle();

        expect(scope.newArticle).to.deep.equal({
          title: '',
          data: []
        });
      });

      it('should call $ionicHistory.goBack()', function() {
        sinon.spy(ionicHistory, 'goBack');

        scope.trashArticle();

        expect(ionicHistory.goBack.calledOnce).to.be.true;
      });
    });

    describe('postArticle', function() {

      beforeEach(function() {
        scope.user = {
          username: 'bob'
        };

        sinon.stub(maps,'getMarker', function() {
          return {
            getPosition: function() {
              return {
                lat: function() { return 1;},
                lng: function() { return 2;}
              }
            }
          }
        });
      });

      it('should call Maps.getMarker', function() {
        scope.postArticle();

        expect(maps.getMarker.calledOnce).to.be.true;
      });

      it('should call Article.create', function() {
        sinon.spy(article, 'create');

        scope.postArticle();

        expect(article.create.calledOnce).to.be.true;
      });

      it('should pass in the correct object to Article.create', function() {
        sinon.stub(article, 'create', function(obj) {
          expect(obj).to.deep.equal({
            isPrivate: false,
            location: {
              lat: 1,
              lng: 2
            },
            username: scope.user.username,
            title: scope.newArticle.title
          });

          return {
            $promise: {
              then: function(cb, errCb) {}
            }
          }
        });

        scope.postArticle();

        expect(article.create.calledOnce).to.be.true;
      });

      it('should call postSubarticle then trashArticle', function() {

        scope.newArticle.data = [{
          title: 'title',
          images: [1,2,3],
          videos: [{
            type: '',
            name: 'name.mp4'
          }]
        }];

        sinon.stub(article, 'create', function(obj) {
          expect(obj).to.deep.equal({
            isPrivate: false,
            location: {
              lat: 1,
              lng: 2
            },
            username: scope.user.username,
            title: scope.newArticle.title
          });

          return {
            $promise: {
              then: function(cb, errCb) {
                obj.id = 'id';
                cb(obj);
              }
            }
          }
        });

        sinon.spy(scope, 'trashArticle');

        scope.postArticle();

        expect(scope.trashArticle.calledOnce).to.be.true;
      });

      it('should call trashArticle', function() {

        scope.newArticle.data = [];

        sinon.stub(article, 'create', function(obj) {
          expect(obj).to.deep.equal({
            isPrivate: false,
            location: {
              lat: 1,
              lng: 2
            },
            username: scope.user.username,
            title: scope.newArticle.title
          });

          return {
            $promise: {
              then: function(cb, errCb) {
                obj.id = 'id';
                cb(obj);
              }
            }
          }
        });

        sinon.spy(scope, 'trashArticle');

        scope.postArticle();

        expect(scope.trashArticle.calledOnce).to.be.true;
      });
    });

    describe('trashSubarticle', function() {

      it('should reset data', function() {
        scope.data = {
          text: 'text',
        };

        scope.trashSubarticle();

        expect(scope.data).to.deep.equal({
          text: ''
        });
      });

      it('should call $ionicHistory.goBack()', function() {
        sinon.spy(ionicHistory, 'goBack');

        scope.trashSubarticle();

        expect(ionicHistory.goBack.calledOnce).to.be.true;
      });
    });

    describe('postSubarticle', function() {
      beforeEach(function() {
          scope.user = {
            username: 'username'
          };
          stateParams.id = 'parent id';
      });

      it('should call postSubarticle then scope.trashSubarticle', function() {
        sinon.spy(scope, 'trashSubarticle');
        scope.postSubarticle();
        
        expect(scope.trashSubarticle.calledOnce).to.be.true;
      });

      it('should post multiple subarticles', function() {
        scope.newArticle.data = [{
          text: 'hey'
        },
        {
          text: 'bye'
        }];

        sinon.spy(article.subarticles, 'create');

        scope.postSubarticle();

        expect(article.subarticles.create.calledTwice).to.be.true;
      });

      describe('postText', function() {
        beforeEach(function() {
          scope.newArticle.data = [{
            text: 'Some text for a subarticle'
          }];

          sinon.stub(article.subarticles, 'create', function(obj) {
            expect(obj).to.deep.equal({
              id: stateParams.id,
              parentId: stateParams.id,
              username: scope.user.username,
              text: scope.newArticle.data[0].text
            });

            return {
              $promise: {
                then: function(cb) {
                  cb();
                }
              }
            }
          });
        });

        it('should call Article.subarticles.create', function() {
          scope.postSubarticle();

          expect(article.subarticles.create.calledOnce).to.be.true;
        });
      });

      describe('postVideo', function() {
        beforeEach(function() {
          scope.newArticle.data = [{
            videos: [{
              type: 'video/mp4',
              nativeURL: '/a/fake/url/filename.mp4',
              thumbnailURI: '/a/fake/uri/image.jpg',
              name: 'video.mp4',
              size: 5000,
              lastModified: Date.now(),
              caption: 'A video caption'
            }]
          }];
        });

        it('should post the videos', function() {
          scope.newArticle.data[0].videos.push({
              type: 'video/mp4',
              nativeURL: '/a/fake/uri/filename',
              name: 'video2.mp4',
              size: 5000,
              lastModified: Date.now(),
              caption: 'A video caption'
          });

          sinon.spy(article.subarticles, 'create');

          scope.postSubarticle();

          expect(article.subarticles.create.calledTwice).to.be.true;
        });

        it('should call FileTransfer.upload twice', function() {
          var call = 0
          sinon.stub(fileTransfer, 'upload', function(server, uri, options) {
            call++;
            if(call === 1) {
              expect(uri).to.equal(scope.newArticle.data[0].videos[0].nativeURL);
            }
            if(call === 2) {
              expect(uri).to.equal(scope.newArticle.data[0].videos[0].thumbnailURI);
            }

            return {
              then: function(succ,err,progr) {
                succ();
              }
            }
          });

          scope.postSubarticle();
          expect(fileTransfer.upload.calledTwice).to.be.true;
        });

        it('should pass the proper object to Articles.subarticle.create', function() {

          var video = scope.newArticle.data[0].videos[0];
          sinon.stub(article.subarticles, 'create', function(obj) {
            expect(obj).to.deep.equal({
              id: stateParams.id,
              parentId: stateParams.id,
              username: scope.user.username,
              _file: {
                type: video.type,
                container: 'instanews.videos.us.east',
                name: video.name,
                size: video.size,
                poster: video.name.slice(0, video.name.lastIndexOf('.') + 1 ) + 'jpg',
                lastModified: video.lastModified,
                caption: video.caption
              }
            });
            return {
              $promise: {
                then: function(cb) {
                  cb();
                }
              }
            }
          });

          scope.postSubarticle();
          expect(article.subarticles.create.calledOnce).to.be.true;
        });

        //TODO
        it('should notify the user and retry when it fails to upload', function() {
        });
        it('should let the user know about the progress of the uploads', function() {
        });
      });

      describe('postPhoto', function() {
        beforeEach(function() {
          var file = {
            type: 'image/jpeg',
            nativeURL: '/a/fake/url/name.jpg',
            name: 'name.jpg',
            size: 5000,
            lastModified: Date.now(),
            caption: 'Photo caption'
          };

          scope.newArticle.data = [{
            images: [file]
          }];
        });

        it('should add the photos', function() {
          scope.newArticle.data[0].images.push({
            URI: '/a/fake/uri/image2',
            caption: 'Another caption'
          });

          sinon.spy(article.subarticles, 'create');
          scope.postSubarticle();

          expect(article.subarticles.create.calledTwice).to.be.true;
        });

        it('should call FileTransfer.upload once with the proper options', function() {
          var file = scope.newArticle.data[0].images[0];
          sinon.stub(fileTransfer, 'upload', function(server, url, options) {
            expect(url).to.equal(file.nativeURL);
            expect(options.fileName).to.equal(file.name);
            expect(options.mimeType).to.equal(file.type);

            return { 
              then: function(cb){
                cb();
              }
            }
          });

          scope.postSubarticle();

          expect(fileTransfer.upload.calledOnce).to.be.true;
        });


        it('should call Article.subarticles.create with the correct argument', function() {
          var file = scope.newArticle.data[0].images[0];
          sinon.stub(article.subarticles, 'create', function(sub) {
            expect(sub).to.deep.equal({
              id: stateParams.id,
              parentId: stateParams.id,
              username: scope.user.username,
              _file: {
                type: file.type,
                name: file.name,
                size: file.size,
                lastModified: file.lastModified,
                caption: file.caption
              }
            });

            return {
              $promise: {
                then: function(cb) {
                  cb()
                }
              }
            }
          });

          scope.postSubarticle();

          expect(article.subarticles.create.calledOnce).to.be.true;
        });
      });
    });

    describe('trashText', function() {

      it('should reset data.text', function() {
        scope.postTextModal = {
          hide: function() {}
        };

        scope.data.text = 'text';

        scope.trashText();

        expect(scope.data.text).to.equal('');
      });

      it('should hide the postTextModal', function() {
        scope.postTextModal = {
          hide: function() {}
        };
        sinon.spy(scope.postTextModal, 'hide');

        scope.trashText();

        expect(scope.postTextModal.hide.calledOnce).to.be.true;
      });
    });

    describe('saveText', function() {

      beforeEach(function() {
        scope.postTextModal = {
          hide: function() {}
        };
      });

      it('should push data.text onto the newArticle object', function() {
        scope.data.text = 'text';
        
        scope.saveText();

        expect(scope.newArticle.data.length).to.equal(1);
        expect(scope.newArticle.data[0].text).to.equal('text');
      });

      it('should call trashText after', function() {
        sinon.spy(scope, 'trashText');

        scope.saveText();
        expect(scope.trashText.calledOnce).to.be.true;
      });
    });

    describe('captureVideo', function() {
      it('should call Camera.getVideo', function() {
        sinon.spy(camera, 'getVideo');
        scope.captureVideo();

        expect(camera.getVideo.calledOnce).to.be.true;
      });

      it('should add the video to the videos on newArticle', function() {
        scope.captureVideo();

        expect(scope.newArticle.data.length).to.equal(1);
        expect(scope.newArticle.data[0].videos.length).to.equal(1);
        expect(scope.newArticle.data[0].videos[0]).to.equal(1);
      });

    });

    describe('getPhotos', function() {
      it('should call Camera.getPictures', function() {
        sinon.spy(camera, 'getPictures');

        scope.getPhotos();

        expect(camera.getPictures.calledOnce).to.be.true;
      });

      it('should add the images to newArticle.data', function() {
        scope.getPhotos();

        expect(scope.newArticle.data.length).to.equal(1);
        expect(scope.newArticle.data[0].images.length).to.equal(2);
        expect(scope.newArticle.data[0].images[0]).to.equal(1);
        expect(scope.newArticle.data[0].images[1]).to.equal(2);
      });
    });

    describe('capturePhoto', function() {
      it('should call Camera.getPicture', function() {
        sinon.spy(camera, 'getPicture');

        scope.capturePhoto();

        expect(camera.getPicture.calledOnce).to.be.true;
      });

      it('should add the image to newArticle.data', function() {
        scope.capturePhoto();

        expect(scope.newArticle.data.length).to.equal(1);
        expect(scope.newArticle.data[0].images.length).to.equal(1);
        expect(scope.newArticle.data[0].images[0]).to.equal('url');
      });
    });
  });
});
