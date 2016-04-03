
'use strict';

var app = angular.module('instanews.service.subarticles', ['ionic', 'ngResource']);

app.service('Subarticles', [
  'Article',
  'ENV',
  'ImageCache',
  'Navigate',
  'Subarticle',
  'Platform',
  'list',
  function(
    Article,
    ENV,
    ImageCache,
    Navigate,
    Subarticle,
    Platform,
    list
  ){
    var articles = [];

    /*
     * TODO Enable this, test it and use it to clear the cache in an LRU fashion
     * Be careful not to clear anything that still has a view for it. It should not but 
     * be careful anyway.
    var remove = function (parentId) {
      var parent;
      console.log('Removing ' + parentType + ' ' + parentId + ' from ' + items.length);

      var art;
      var i = -1;
      for(i in articles) {
        if(articless[i].spec.options.id === parentId) {
          art = articles[i];
          break;
        }
      }

      if(art) {
        articles.splice(i,1);
      }
    };
    */

    var findOrCreate = function (parentId) {
      var parent;
      articles.forEach(function(article) {
        if(article.spec.options.id === parentId) {
          console.log('Found cached copy of subarticles');
          parent = article;
        }
      });

      if(!parent) {
        parent = {
          spec: {
            options: {
              id: parentId
            }
          }
        };
        parent.subarticles = subarticleList(parent.spec);

        parent.subarticles.getSpec = function () {
          return parent.spec;
        };

        articles.push(parent);
      }

      return parent.subarticles;
    };

    var subarticleList = function (spec) {
      // Triggered when an item in the list wants to be updated
      var update = function (newValue, oldValue) {
        if( newValue.modified >= oldValue.modified ) {
          oldValue.rating = newValue.rating;
          oldValue.modified = newValue.modified;
          oldValue.downVoteCount = newValue.downVoteCount;
          oldValue.upVoteCount = newValue.upVoteCount;
          oldValue.createCommentCount = newValue.createCommentCount;
          oldValue.upVotes = newValue.upVotes;
          oldValue.version = newValue.version;
          oldValue.text = newValue.text;
          oldValue._file = newValue._file;
        }
      };

      var save = function () {
        var data = {};
        if(this._file) {
           data = {
            '_file.caption': this._file.caption
          };
        } else {
           data = {
            text: this.text
          };
        }

        Subarticle.prototype$updateAttributes({
          id: this.id
        }, data,
        function () {
          console.log('Succesfully updated subarticle');
        },
        function (err) {
          console.log(err);
        });
      };   

      var destroy = function () {
        var id = this.id;
        if(subarticles.get().length === 1) {
          Navigate.goBack();
        }

        Subarticle.deleteById({id: this.id})
        .$promise
        .then(function () {
          console.log('Succesfully deleted the subarticle');
          subarticles.remove(function (subarticle) {
            return (subarticle.id === id); 
          });
        },
        function (err) {
          console.log(err);
          Platform.showAlert('Please try again.', 'Delete Failed!');
        });
      }; 

      var focus = function () {
        var sub = this;
        Navigate.go('app.article', { id: sub.parentId });
        sub.enableFocus = true;
        subarticles.add(sub, function() {
          console.log('Focusing on subarticle: ' + sub.id);
        });
      };

      var filter = {
        skip: 0,
        limit: 100,
        where: {
          pending: {
            exists: false
          } 
        },
        order: 'rating DESC'
      };

      if(!spec || !spec.options || !spec.options.id) {
        console.log('Cannot create a subarticle list without the parent id!');
        console.log('Please set spec.options.id');
        return;
      }

      spec.options.filter = spec.options.filter || filter;
      spec.options.filter.where = spec.options.filter.where || filter.where;
      spec.options.filter.order = spec.options.filter.order || filter.order;
      spec.options.filter.limit = spec.options.filter.limit || filter.limit;

      spec.find = Article.subarticles;
      spec.findById = Subarticle.findById;
      spec.focus = spec.focus || focus;
      spec.update = spec.update || update;
      spec.save = spec.save || save;
      spec.destroy = spec.destroy || destroy;

      spec.preLoad = preLoad;

      // Create a list for articles within view
      var subarticles = list(spec);

      return subarticles;
    };

    var findById = function (id, cb) {
      Subarticle.findById({ id: id })
      .$promise
      .then(function(sub) {
        var subs =  findOrCreate(sub.parentId);
        subs.add(sub);
        cb(subs);
      }, function (err) {
        console.log(err);
        cb();
      });
    };

    var focusById = function (id) {
      Platform.loading.show();
      findById(id, function(subs) {
        if(subs) {
          subs.focusById(id);
        } else { 
          Platform.loading.hide();
          Platform.showToast('Sorry! That content seems to be missing');
        }
      });
    };

    var preLoad = function (sub, cb) {
      if(!sub.preloaded) {
        sub.preloaded = true;
        if(sub._file) {
          var urlBase = ENV.photoEndpoint;
          var getUrl = function(fileName) {
            var url = fileName;
            if(fileName.indexOf('file://') !== 0) {
              url = urlBase + '/' + url;
            }
            return url;
          };

          var findImageSource = function (file) {
            var prefix = getImagePrefix(file.sources);
            var src = prefix + '-' + file.name;

            // If this is a video then it will
            // have a poster which should be used
            // instead of other sources
            if(file.poster) {
              urlBase = ENV.videoEndpoint;
              src = file.poster;
            } else if(file.source) {
              // Local source
              src = file.source;
            }

            // istanbul ignore else 
            if(src) {
              return getUrl(src);
            } else {
              //TODO Create some kind of image that lets users know the photo is broken
              console.error('There is no valid photo source given!');
              console.log(file);
              //TODO Get the image that we are using (look at media)
            }
          };

          var getImagePrefix = function(sources) {

            //TODO Come up with a more clear solution for 
            //the quality mapping
            
            // Gets the max image size available
            var prefixs = ['XS', 'S', 'M', 'L'];
            var done = false;
            var max = -1;
            for(var j in prefixs) {
              var idx = prefixs.length - 1 - j;
              var p = prefixs[idx];
              for(var i in sources) {
                var source = sources[i];
                if(source.prefix === p) {
                  max = idx;
                  done = true;
                  break;
                }
              }
              if(done) {
                break;
              }
            }

            //Get the recommended size with that max value
            return  Platform.getSizeClassPrefix(max);
          };

          ImageCache.Cache(findImageSource(sub._file))
          .then( function() {
            cb(null, sub);
          }, function(err) {
            console.log(err);
            sub.preloaded = false;
            cb(new Error('Failed to cache the image!'));
          });
        } else {
          cb(null, sub);
        }
      } else {
        cb(null, sub);
      }
    }; 

    return {
      findById: findById,
      focusById: focusById,
      findOrCreate: findOrCreate 
    };
  }
]);


