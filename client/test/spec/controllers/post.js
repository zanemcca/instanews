
describe('Post: ', function(){

  var deferred;
  var article;
  var place;
  var uplds;
  var picture, video, media;

  //Load the module and create mocks for all dependencies
  beforeEach( function() {
    article = {
      title: ''
    };

    place = {
      getMap: function () {}, 
      localize: function () {}    // localize is filled in by the autocomplete directive
    };

    video = 'video';
    picture = 'picture';
    media = {
      type: 'image'
    };

    uplds = {
      hasMediaItems: function () {
        return false;
      }
    };

    module('instanews.controller.post');

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

      $provide.service('Post', function() {
        return {
          getNewArticle: function () {
            return article;
          },
          getPlace: function () {
            return place;
          },
          saveParentId: function(id, tempId) {
            return {
              tempId: 'uuid',
              parentId: id,
              title: '',
              videos: [],
              photos: [],
              text: []
            };
          },
          getArticle: function(tempId) {
            return {
              tempId: tempId,
              parentId: '',
              title: '',
              videos: [],
              photos: [],
              text: []
            };
          },
          deleteArticle: function(tempId) {},
          isPosting: function() { return false; },
          savePosition: function(pos, tempId) {},
          saveTitle: function(title, tempId) {},
          saveText: function(text, tempId) {
            txt = text;
            if( typeof text === 'string') {
              txt = [text];
            }
            return {
              tempId: tempId,
              parentId: '',
              title: '',
              videos: [],
              photos: [],
              text: txt
            };
          },
          saveVideos: function(videos, tempId) {
            vids = videos;
            if( typeof videos === 'string') {
              vids = [vidoes];
            }
            return {
              tempId: tempId,
              parentId: '',
              title: '',
              videos: vids,
              photos: [],
              text: [] 
            };
          },
          savePhotos: function(photos, tempId) {
            images = photos;
            if( typeof photos === 'string') {
              images = [photos];
            }
            return {
              tempId: tempId,
              parentId: '',
              title: '',
              videos: [],
              photos: images,
              text: []
            };
          },
          post: function(tempId) {}
        }
      });

      $provide.service('Platform', function() {
        return {
          showSheet: function(sheet) {},
          showToast: function(message) {}
        }
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

      $provide.service('Upload', function() {
        return {
          destroy: function(uploads) {},
          text: function(text) {
            return {
              subarticle: {
                text: text
              }
            };
          },
          video: function(video) {
            return {
              subarticle: {
                _file: {
                  type: 'video'
                }
              }
            };
          },
          picture: function(image) {
            return {
              subarticle: {
                _file: {
                  type: 'image'
                }
              }
            };
          },
        }
      });

      $provide.service('Uploads', function() {
        return {
          findOrCreate: function(id) {
            return {
              get: function() {
                return uplds;
              }
            };
          }
        };
      });

      $provide.service('Camera', function() {
        return {
          capturePicture: function() {
            return {
              then: function(cb) {
                cb(picture);
              }
            }
          },
          openMediaGallery: function() {
            return {
              then: function (cb) {
                cb(media);
              }
            };
          },
          captureVideo: function() {
            return {
              then: function(cb) {
                cb(video);
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

      $provide.service('Navigate', function() {
        return {
          goBack: function () {},
          disableNextBack: function() {},
          scroll: function (spec) {
            return {
              onScroll: function() {
                return false;
              },
              scrollTop: function() {}
            };
          },
          toggleMenu: function() {}
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
    $stateParams,
    $ionicModal,
    $ionicHistory,
    Article,
    Articles,
    Post,
    Platform,
    Maps,
    Navigate,
    User,
    Upload,
    Uploads,
    Camera
  ){
    ionicModal = $ionicModal;
    ionicHistory = $ionicHistory;
    stateParams = $stateParams;
    article = Article;
    articles = Articles;
    post = Post;
    platform = Platform;
    maps = Maps;
    navigate = Navigate;
    user = User;
    upload = Upload;
    uploads = Uploads;
    camera = Camera;
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
      Post: post,
      Platform: platform,
      Maps: maps,
      User: user,
      Upload: upload,
      Camera: camera
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

    it('should localize on ionicView.beforeEnter', function() {
      sinon.stub(scope, '$on', function(text, cb) {
        expect(text).to.equal('$ionicView.beforeEnter');
        cb();
      });

      initController();

      expect(scope.$on.calledOnce).to.be.true;
    });

    // The local article was removed
    it.skip('should call Articles.getOne and set the local article', function() {
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

    //TODO Move this into textInput test
    it.skip('should setup the postTextModal', function() {
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

    var upld, uploader;
    beforeEach(function () {
      upld = 'upload';
      uploader = function (text) {
        return upld;
      };

      sinon.stub(upload, 'text', function (text) {
        return uploader(text);
      });

      sinon.stub(upload, 'video', function (text) {
        return uploader(text);
      });

      sinon.stub(upload, 'picture', function (text) {
        return uploader(text);
      });
    });

    //TODO Move this to autocomplete
    describe.skip('localize', function() {
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

    //TODO Redo or delete
    describe.skip('goBack', function() {

      // No saving for the first version of the app
      it.skip('should pass in a single button titled "<b>Save</b>"', function() {
        sinon.stub(platform, 'showSheet', function(sheet) {
          expect(sheet.buttons.length).to.equal(1);
          expect(sheet.buttons[0].text).to.equal('<b>Save</b>');
        });

        scope.goBack();

        expect(platform.showSheet.calledOnce).to.be.true;
      });

      it('should pass in destructiveText = "Delete"', function() {
        sinon.stub(platform, 'showSheet', function(sheet) {
          expect(sheet.destructiveText).to.equal('Delete');
        });

        scope.goBack();

        expect(platform.showSheet.calledOnce).to.be.true;
      });

      it('should pass in proper titleText', function() {
        sinon.stub(platform, 'showSheet', function(sheet) {
          expect(sheet.titleText).to.equal('Your unpublished content will be lost if you continue!');
        });

        scope.goBack();

        expect(platform.showSheet.calledOnce).to.be.true;
      });

      it('should pass in cancelText = "Cancel"', function() {
        sinon.stub(platform, 'showSheet', function(sheet) {
          expect(sheet.cancelText).to.equal('Cancel');
        });

        scope.goBack();

        expect(platform.showSheet.calledOnce).to.be.true;
      });


      it('should call Navigate.goBack() when save is called', function() {
        sinon.spy(navigate, 'goBack');
        sinon.stub(platform, 'showSheet', function(sheet) {
          sheet.buttonClicked();
        });

        scope.goBack();

        expect(platform.showSheet.calledOnce).to.be.true;
        expect(navigate.goBack.calledOnce).to.be.true;
      });

      it('should call Upload.destroy then Navigate.goBack() when delete is clicked', function() {
        sinon.spy(navigate, 'goBack');
        sinon.spy(upload, 'destroy');
        sinon.stub(platform, 'showSheet', function(sheet) {
          sheet.destructiveButtonClicked();
        });

        scope.goBack();

        expect(platform.showSheet.calledOnce).to.be.true;
        expect(upload.destroy.calledOnce).to.be.true;
        expect(navigate.goBack.calledOnce).to.be.true;
      });
    });

    /*
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

      it('should call Post.savePosition', function() {
        sinon.spy(post, 'savePosition');

        scope.postArticle();

        expect(post.savePosition.calledOnce).to.be.true;
      });

      it('should call Post.saveTitle', function() {
        sinon.spy(post, 'saveTitle');

        scope.postArticle();

        expect(post.saveTitle.calledOnce).to.be.true;
      });

      it('should call Post.post', function() {
        sinon.spy(post, 'post');

        scope.postArticle();

        expect(post.post.calledOnce).to.be.true;
      });
    });

    describe('postSubarticle', function() {
      beforeEach(function() {
        scope.user = {
          username: 'username'
        };
        stateParams.id = 'parent id';
      });

      it('should call Post.post', function() {
        sinon.spy(post, 'post');

        scope.postSubarticle();

        expect(post.post.calledOnce).to.be.true;
      });

      describe('exit', function() {
        it('should call Post.isPosting', function() {
          sinon.spy(post, 'isPosting');
          scope.postSubarticle();
          expect(post.isPosting.calledOnce).to.be.true;
        });

        it('should call Platform.showToast', function() {
          sinon.stub(post, 'isPosting', function() {
            return true;
          });
          sinon.spy(platform, 'showToast');
          scope.postSubarticle();
          expect(post.isPosting.calledOnce).to.be.true;
          expect(platform.showToast.calledOnce).to.be.true;
        });

        it('should call Platform.showToast with the correct message', function() {
          sinon.stub(post, 'isPosting', function() {
            return true;
          });
          sinon.stub(platform, 'showToast', function(message) {
            expect(message).to.equal('We\'ll let you know when your content is uploaded');
          });
          scope.postSubarticle();
          expect(platform.showToast.calledOnce).to.be.true;
        });

      it('should call $ionicHistory.goBack()', function() {
        sinon.spy(ionicHistory, 'goBack');
        scope.postSubarticle();
        expect(ionicHistory.goBack.calledOnce).to.be.true;
      });
      });
    });
    */

    //TODO Move these to uploads test

    describe.skip('trashText', function() {

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
      });
    }); 

    describe.skip('saveText', function() {

      beforeEach(function() {
        scope.postTextModal = {
          hide: function() {}
        };
      });

      it('should push data.text onto the scope.uploads', function() {
        scope.data.text = 'text';
        scope.saveText();

        expect(upload.text.calledOnce).to.be.true;
        expect(scope.uploads.length).to.equal(1);
        expect(scope.uploads[0]).to.equal(upld);
      });

      it('should call trashText after', function() {
        sinon.spy(scope, 'trashText');

        scope.saveText();
        expect(scope.trashText.calledOnce).to.be.true;
      });
    });

    describe.skip('captureVideo', function() {
      it('should call Camera.captureVideo', function() {
        sinon.spy(camera, 'captureVideo');
        scope.captureVideo();

        expect(camera.captureVideo.calledOnce).to.be.true;
      });

      it('should add the video to uploads', function() {
        uploader = function (vid) {
          expect(vid).to.equal(video);
          return upld;
        };

        scope.captureVideo();

        expect(upload.video.calledOnce).to.be.true;
        expect(scope.uploads.length).to.equal(1);
        expect(scope.uploads[0]).to.equal(upld);
      });
    });

    describe.skip('openMediaGallery', function() {
      it('should call Camera.openMediaGallery', function() {
        sinon.spy(camera, 'openMediaGallery');

        scope.openMediaGallery();
        expect(camera.openMediaGallery.calledOnce).to.be.true;
      });

      it('should add the photo to uploads', function() {
        uploader = function(pic) {
          expect(pic).to.deep.equal(media);
          return upld;
        };

        scope.openMediaGallery();

        expect(upload.picture.calledOnce).to.be.true;
        expect(scope.uploads.length).to.equal(1);
        expect(scope.uploads[0]).to.equal(upld);
      });

      it('should add the video to uploads', function() {
        media.type = 'video';
        uploader = function(vid) {
          expect(vid).to.deep.equal(media);
          return upld;
        };

        scope.openMediaGallery();

        expect(upload.video.calledOnce).to.be.true;
        expect(scope.uploads.length).to.equal(1);
        expect(scope.uploads[0]).to.equal(upld);
      });
    });

    describe.skip('capturePicture', function() {
      it('should call Camera.getPicture', function() {
        sinon.spy(camera, 'capturePicture');

        scope.capturePicture();

        expect(camera.capturePicture.calledOnce).to.be.true;
      });

      it('should add the photo to uploads', function() {
        uploader = function (pic) {
          expect(pic).to.equal(picture);
          return upld;
        };

        scope.capturePicture();

        expect(upload.picture.calledOnce).to.be.true;
        expect(scope.uploads.length).to.equal(1);
        expect(scope.uploads[0]).to.equal(upld);
      });
    });
  });
});
