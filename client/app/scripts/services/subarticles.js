
'use strict';

var app = angular.module('instanews.service.subarticles', ['ionic', 'ngResource']);

app.service('Subarticles', [
  'Article',
  'Navigate',
  'Subarticle',
  'Platform',
  'list',
  function(
    Article,
    Navigate,
    Subarticle,
    Platform,
    list
  ){
    var articles = [];

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
              id: parentId,
              filter: {
                limit: 1
              }
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
        },
        function (err) {
          console.log(err);
        });

        subarticles.remove(function (subarticle) {
          return (subarticle.id === id); 
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
        limit: 1,
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

    return {
      findById: findById,
      focusById: focusById,
      findOrCreate: findOrCreate 
    };
  }
]);
