      
"use strict";

describe('Post service', function() {

  var newArticle;
  beforeEach(function() {
    newArticle = { 
      tempId: 'uuid',
      title: 'Title',
      position: {
        lat: 1,
        lng: 2
      },
      text: ['Hey'],
      videos: [],
      photos: [],
      isValidArticle: function() {
        return true;
      },
      isValidSubarticle: function() {
        return true;
      }
    };

    module('instanews.service.post');

    module(function($provide) {
      $provide.service('Article', function() {
        return {
          find: function(filter) {},
          create: function(obj) {
            return {
              $promise: {
                then: function(cb) { 
                  cb({
                   id: 'id'
                  }); 
                }
              }
            };
          },
          subarticles: {
            create: function(obj) {
              return {
                $promise: {
                  then: function(cb, err) { 
                    var res = obj;
                    res.id = 'randomId';
                    cb(res);
                  }
                }
              };
            }
          }
        };
      });

      $provide.service('LocalStorage', function() {
        return {
          readFiles: function(dir, cb) {
            cb(null, [newArticle]);
          },
          deleteFile: function(dir,name) {},
          writeFile: function(dir,name,file) {}
        };
      });

      $provide.service('ENV', function() {
        return {
          apiEndPoint: 'http://localhost:3000/api'
        };
      });

      $provide.service('FileTransfer', function() {
        return {
          upload: function(server, uri, options) {
            return {
              then: function(cb) {
                cb();
              }
            };
          }
        };
      });

      $provide.service('User', function() {
        return {
          get: function() {
            return {
              username: 'bob'
            };
          },
          getToken: function() {
            return 'token';
          }
        };
      });

      $provide.service('Platform', function() {
        return {
          ready: {
            then: function(cb) {
              cb();
            }
          },
          showToast: function(message) {}
        };
      });

      $provide.service('rfc4122', function() {
        return {
          v4: function() { return 'uuid'; }
        };
      });

    });

  });

  var post;
  var article;
  var localStorage;
  var fileTransfer;
  var env;
  var user;
  var platform;
  var RFC4122;

  beforeEach(inject(function(
    Post,
    Article,
    LocalStorage,
    ENV,
    FileTransfer,
    User,
    Platform,
    rfc4122
  ) {
    post = Post;
    article = Article;
    localStorage = LocalStorage;
    fileTransfer = FileTransfer;
    env = ENV;
    user = User;
    platform = Platform;
    RFC4122 = rfc4122;
  }));

  describe('Initialization', function() {
    it('should call LocalStorage.readFiles', function() {
      var art = post.getArticle('uuid');
      expect(art.tempId).to.equal('uuid');
    });
  });

  describe('getArticle', function() {
    it('should get the article', function() {
      var art = post.getArticle(newArticle.tempId);
      expect(art).to.deep.equal(newArticle);
    });

    it('should get a new article', function() {
      var art = post.getArticle();

      expect(art.tempId).to.exist;
      expect(art.videos).to.exist;
      expect(art.videos).to.be.empty;
      expect(art.photos).to.exist;
      expect(art.photos).to.be.empty;
      expect(art.text).to.exist;
      expect(art.text).to.be.empty;
    });

    describe('isValidArticle', function() {
      var art;
      beforeEach(function() {
        art = post.getArticle();
        art.title = 'Title';
        art.text = ['some text'];
        art.position = {
          lat: 1,
          lng: 2
        };
      });

      it('should be valid', function() {
        expect(art.isValidArticle()).to.be.true;
      });

      describe('invalid', function() {
        it('should have a title', function() {
          art.title = '';
          expect(art.isValidArticle()).to.be.false;
        });

        it('should have at least one subarticle', function() {
          art.text = [];
          expect(art.isValidArticle()).to.be.false;
        });

        it('should have a valid position', function() {
          art.position = {};
          expect(art.isValidArticle()).to.be.false;
        });
      });
    });

    describe('isValidSubarticle', function() {
      var art;
      beforeEach(function() {
        art = post.getArticle();
        art.parentId = 'validId';
        art.text = ['some text'];
      });

      it('should be valid', function() {
        expect(art.isValidSubarticle()).to.be.true;
      });

      describe('invalid', function() {
        it('should have a parentId', function() {
          art.parentId = '';
          expect(art.isValidSubarticle()).to.be.false;
        });

        it('should have at least one subarticle', function() {
          art.text = [];
          expect(art.isValidSubarticle()).to.be.false;
        });
      });
    });
  });

  describe('saveVideos', function() {
    it('should save one', function() {
      newArticle = post.saveVideos({
        name: 'videoTest.mp4'
      }, newArticle.tempId);

      expect(newArticle.videos.length).to.equal(1);
      expect(newArticle.videos[0].name).to.equal('videoTest.mp4');
    });

    it('should save more than one', function() {
      newArticle = post.saveVideos([{
        name: 'videoTest.mp4'
      },
      {
        name: 'videoTest2.mp4'
      }],
      newArticle.tempId);

      expect(newArticle.videos.length).to.equal(2);
      expect(newArticle.videos[0].name).to.equal('videoTest.mp4');
      expect(newArticle.videos[1].name).to.equal('videoTest2.mp4');
    });
  });

  describe('savePhotos', function() {
    it('should save one', function() {
      newArticle = post.savePhotos({
        name: 'photoTest.mp4'
      }, newArticle.tempId);

      expect(newArticle.photos.length).to.equal(1);
      expect(newArticle.photos[0].name).to.equal('photoTest.mp4');
    });

    it('should save more than one', function() {
      newArticle = post.savePhotos([{
        name: 'photoTest.mp4'
      },
      {
        name: 'photoTest2.mp4'
      }],
      newArticle.tempId);

      expect(newArticle.photos.length).to.equal(2);
      expect(newArticle.photos[0].name).to.equal('photoTest.mp4');
      expect(newArticle.photos[1].name).to.equal('photoTest2.mp4');
    });
  });

  describe('saveText', function() {
    beforeEach(function() {
      newArticle = post.deleteText(newArticle.text[0], newArticle.tempId);
    });

    it('should save one', function() {
      newArticle = post.saveText('textOne', newArticle.tempId);

      expect(newArticle.text.length).to.equal(1);
      expect(newArticle.text[0]).to.equal('textOne');
    });

    it('should save more than one', function() {
      newArticle = post.saveText(['textOne', 'textTwo'], newArticle.tempId);

      expect(newArticle.text.length).to.equal(2);
      expect(newArticle.text[0]).to.equal('textOne');
      expect(newArticle.text[1]).to.equal('textTwo');
    });
  });

  describe('saveParentId', function() {
    it('should save the parentId', function() {
      var id = 'unique id 34jkbnkjfnr4';
      newArticle = post.saveParentId(id, newArticle.tempId);

      expect(newArticle.parentId).to.equal(id);
    });
  });

  describe('savePosition', function() {
    it('should save the position', function() {
      var position = {
        lat: 67,
        lng: -65
      };
      newArticle = post.savePosition(position, newArticle.tempId);

      expect(newArticle.position).to.deep.equal(position);
    });

    it('should not save the position', function() {
      var position = {
        lng: -65
      };
      newArticle = post.savePosition(position, newArticle.tempId);

      expect(newArticle.position).to.not.deep.equal(position);
    });
  });

  describe('saveTitle', function() {
    it('should save the title', function() {
      var title = 'A New Title';
      newArticle = post.saveTitle(title, newArticle.tempId);
      expect(newArticle.title).to.equal(title);
    });
  });

  describe('saveArticle', function() {
    var art;
    beforeEach(function() {
      art = post.getArticle();
    });

    it('should save the old one', function() {
      newArticle = post.saveArticle(art);

      expect(newArticle.tempId).to.equal(art.tempId);
    });
  });

  describe('deleteVideo', function() {
    var video;
    beforeEach(function() {
      video = { 
        name: 'deleteVideo'
      };
      newArticle.videos = [video];
      post.saveArticle(newArticle);
    });

    it('should delete the video', function() {
      newArticle = post.deleteVideo(video);
      expect(newArticle.videos.length).to.equal(0);
    });
  });

  describe('deletePhoto', function() {
    var photo;
    beforeEach(function() {
      photo = { 
        name: 'deletePhoto'
      };
      newArticle.photos = [photo];
      post.saveArticle(newArticle);
    });

    it('should delete', function() {
      newArticle = post.deletePhoto(photo);
      expect(newArticle.photos.length).to.equal(0);
    });
  });

  describe('deleteText', function() {
    var text;
    beforeEach(function() {
      text = 'delete'
      newArticle.text = [text];
      post.saveArticle(newArticle);
    });

    it('should delete', function() {
      newArticle = post.deleteText(text);
      expect(newArticle.text.length).to.equal(0);
    });
  });

  describe('deleteArticle', function() {
    it('should delete', function() {
      post.deleteArticle(newArticle);
      newArticle = post.getArticle(newArticle.tempId);
      expect(newArticle).to.be.undefined;
    });
  });

  describe('isPosting', function() {
    it('should return false', function() {
      expect(post.isPosting()).to.be.false;
    });
  });

  describe('post', function() {

    describe('Article create', function() {
      it('should pass in the correct object to Article.create', function() {

        sinon.stub(article, 'create', function(obj) {
          expect(obj).to.deep.equal({
            isPrivate: false,
            location: {
              lat: 1,
              lng: 2
            },
            username: user.get().username,
            title: 'Title' 
          });

          return {
            $promise: {
              then: function(cb, errCb) {}
            }
          }
        });

        post.post(newArticle.tempId);

        expect(article.create.calledOnce).to.be.true;
      });

      it('should delete the article after posting everything', function() {
        post.post(newArticle.tempId);

        var art = post.getArticle(newArticle.tempId);

        expect(art).to.be.undefined;
      });

      it('should call Article.subarticles.create through postSubarticle', function() {
        sinon.spy(article.subarticles, 'create');

        post.post(newArticle.tempId);

        expect(article.subarticles.create.calledOnce).to.be.true;
      });
    });

    describe('postSubarticle', function() {
      beforeEach(function() {
        newArticle.parentId = 'id';
        newArticle.isValidArticle = function() {
          return false;
        };
        post.saveArticle(newArticle);
      });

      it('should delete the article after posting everything', function() {
        post.post(newArticle.tempId);

        var art = post.getArticle(newArticle.tempId);

        expect(art).to.be.undefined;
      });

      it('should call Platform.showToast with message "Your content has finished uploading"', function() {
        sinon.stub(platform,'showToast', function(message) {
          expect(message).to.equal('Your content has finished uploading');
        });

        post.post(newArticle.tempId);

        expect(platform.showToast.calledOnce).to.be.true;
      });

      it('should post one text subarticle', function() {
        sinon.stub(article.subarticles, 'create', function(sub) {

          expect(sub.id).to.equal(newArticle.parentId);
          expect(sub.parentId).to.equal(newArticle.parentId);
          expect(sub.username).to.equal(user.get().username);
          expect(sub.text).to.equal(newArticle.text[0]);

          return {
            $promise: {
              then: function(cb) {
                cb({
                  id: 'subId'
                });
              }
            }
          };
        });

        post.post(newArticle.tempId);

        expect(article.subarticles.create.calledOnce).to.be.true;
      });

      it('should post more than one text subarticle', function() {
        newArticle.text = ['text1','text2'];
        post.saveArticle(newArticle);

        sinon.stub(article.subarticles, 'create', function(sub) {

          expect(sub.id).to.equal(newArticle.parentId);
          expect(sub.parentId).to.equal(newArticle.parentId);
          expect(sub.username).to.equal(user.get().username);
          expect(sub.text).to.exist;

          return {
            $promise: {
              then: function(cb) {
                cb({
                  id: 'subId'
                });
              }
            }
          };
        });
        sinon.spy(platform, 'showToast');

        post.post(newArticle.tempId);

        expect(article.subarticles.create.calledTwice).to.be.true;
      });

      describe('video', function() {
        beforeEach( function() {
          newArticle.text = [];
          newArticle.videos = [{
            type: 'video/mp4',
            nativeURL: 'file://a/fake/url/video.mp4',
            name: 'vid.mp4',
            size: 50000,
            lastModified: Date.now(),
            thumbnailURI: 'file://a/fake/thumbnail.jpg',
            caption: 'Video Caption'
          }];
          post.saveArticle(newArticle);
        });

        it('should call FileTransfer.upload twice',function() {
          var count = 0;
          sinon.stub(fileTransfer, 'upload', function(server, url, options) {
            expect(server).to.equal(env.apiEndpoint + '/storages/instanews.videos.us.east/upload');
            expect(options.headers).to.deep.equal({ 'Authorization': user.getToken()});
            if(count === 0) {
              expect(url).to.equal(newArticle.videos[0].nativeURL);
              expect(options.fileName).to.equal(newArticle.videos[0].name);
              expect(options.mimeType).to.equal(newArticle.videos[0].type);
            }
            else {
              expect(url).to.equal(newArticle.videos[0].thumbnailURI);
              expect(options.fileName).to.equal('vid.jpg');
              expect(options.mimeType).to.equal('image/jpeg');
            }
            count++;
            return {
              then: function(cb, err) {
                cb();
              }
            };
          });

          post.post(newArticle.tempId);

          expect(fileTransfer.upload.calledTwice).to.be.true;
        });

        it('should post one video subarticle', function() {
          sinon.stub(article.subarticles, 'create', function(sub) {

            var video = newArticle.videos[0];
            expect(sub).to.deep.equal({
              id: newArticle.parentId,
              parentId: newArticle.parentId,
              username: user.get().username,
              _file: {
                container: 'instanews.videos.us.east',
                type: video.type,
                name: video.name,
                size: video.size,
                poster: video.name.slice(0,video.name.lastIndexOf('.') + 1) + 'jpg',
                lastModified: video.lastModified,
                caption: video.caption
              }
            });

            return {
              $promise: {
                then: function(cb) {
                  cb({
                    id: 'subId'
                  });
                }
              }
            };
          });

          post.post(newArticle.tempId);

          expect(article.subarticles.create.calledOnce).to.be.true;
        });

        it('should post more than one video subarticle', function() {
          newArticle = post.saveVideos({
            type: 'video/mp4',
            name: 'video2.mp4',
            size: 10000,
            lastModified: Date.now(),
            caption: 'Video 2 Caption'
          }, newArticle.tempId);

          sinon.stub(article.subarticles, 'create', function(sub) {
            expect(sub._file).to.exist;
            expect(sub._file.container).to.equal('instanews.videos.us.east');
            return {
              $promise: {
                then: function(cb) {
                  cb({
                    id: 'subId'
                  });
                }
              }
            };
          });

          post.post(newArticle.tempId);

          expect(article.subarticles.create.calledTwice).to.be.true;
        });
      });

      describe('photo', function() {
        beforeEach( function() {
          newArticle.text = [];
          newArticle.photos = [{
            type: 'image/jpg',
            nativeURL: 'file://a/fake/url/photo.jpg',
            name: 'photo.mp4',
            size: 5000,
            lastModified: Date.now(),
            caption: 'Photo Caption'
          }];
          post.saveArticle(newArticle);
        });

        it('should call FileTransfer.upload once',function() {
          sinon.stub(fileTransfer, 'upload', function(server, url, options) {
            expect(server).to.equal(env.apiEndpoint + '/storages/instanews.photos.us.east/upload');
            expect(options.headers).to.deep.equal({ 'Authorization': user.getToken()});
            expect(url).to.equal(newArticle.photos[0].nativeURL);
            expect(options.fileName).to.equal(newArticle.photos[0].name);
            expect(options.mimeType).to.equal(newArticle.photos[0].type);

            return {
              then: function(cb, err) {
                cb();
              }
            };
          });

          post.post(newArticle.tempId);

          expect(fileTransfer.upload.calledOnce).to.be.true;
        });

        it('should post one subarticle', function() {
          sinon.stub(article.subarticles, 'create', function(sub) {

            var photo = newArticle.photos[0];
            expect(sub).to.deep.equal({
              id: newArticle.parentId,
              parentId: newArticle.parentId,
              username: user.get().username,
              _file: {
                container: 'instanews.photos.us.east',
                type: photo.type,
                name: photo.name,
                size: photo.size,
                lastModified: photo.lastModified,
                caption: photo.caption
              }
            });

            return {
              $promise: {
                then: function(cb) {
                  cb({
                    id: 'subId'
                  });
                }
              }
            };
          });

          post.post(newArticle.tempId);

          expect(article.subarticles.create.calledOnce).to.be.true;
        });

        it('should post more than one subarticle', function() {
          newArticle = post.savePhotos({
            type: 'image/jpeg',
            name: 'image.jpg',
            size: 10000,
            lastModified: Date.now(),
            caption: 'Photo 2 Caption'
          }, newArticle.tempId);

          sinon.stub(article.subarticles, 'create', function(sub) {
            expect(sub._file).to.exist;
            expect(sub._file.container).to.equal('instanews.photos.us.east');
            return {
              $promise: {
                then: function(cb) {
                  cb({
                    id: 'subId'
                  });
                }
              }
            };
          });

          post.post(newArticle.tempId);

          expect(article.subarticles.create.calledTwice).to.be.true;
        });
      });
    });
  });
});
