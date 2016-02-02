
'use strict';

var app = angular.module('instanews.service.comments', ['ionic', 'ngResource']);

app.service('Comments', [
  'Article',
  'Subarticle',
  'Subarticles',
  'Comment',
  'list',
  'Navigate',
  'Platform',
  function(
    Article,
    Subarticle,
    Subarticles,
    Comment,
    list,
    Navigate,
    Platform
  ){
    var cache ={
      article: [],
      subarticle: [],
      comment: []
    };

    var Models = {
      article: Article,
      comment: Comment,
      subarticle: Subarticle
    }; 

    var findOrCreate = function (commentableType, commentableId) {
      var parent;
      var items = cache[commentableType];
      if(!items) {
        console.log(commentableType + ' is not a valid commentableType');
        return;
      }

      items.forEach(function(item) {
        if(item.spec.options.id === commentableId) {
          console.log('Found cached copy of comments');
          parent = item;
        }
       });

      if(!parent) {
        parent = {
          spec: {
            options: {
              id: commentableId
            }
          }
        };
        parent.comments = commentList(commentableType, parent.spec);

        parent.comments.getSpec = function () {
          return parent.spec;
        };

        items.push(parent);
      }

      return parent.comments;
    };

    var commentList = function (commentableType, spec) {
      // Triggered when an item in the list wants to be updated
      var update = function (newValue, oldValue) {
        if( newValue.modified >= oldValue.modified ) {
          oldValue.rating = newValue.rating;
          oldValue.modified = newValue.modified;
          oldValue.downVoteCount = newValue.downVoteCount;
          oldValue.upVoteCount = newValue.upVoteCount;
          oldValue.upVotes = newValue.upVotes;
          oldValue.version = newValue.version;
          oldValue.content = newValue.content;
        }
      };

      var save = function () {
        Comment.prototype$updateAttributes({
          id: this.id
        },
        {
          content: this.content
        },
        function () {
          console.log('Successful comment update');
        },
        function (err) {
          console.log(err);
        });
      };

      var destroy = function () {
        var id = this.id;
        Comment.deleteById({id: this.id})
        .$promise
        .then(function () {
          console.log('Succesfully deleted the comment');
        },
        function (err) {
          console.log(err);
        });

        comments.remove(function (comment) {
          return (comment.id === id); 
        });
      };

      var focus = function () {
        var com = this;
        com.enableFocus = true;
        comments.add(com, function() {
          console.log('Focusing on comment: ' + com.id);
        });

        switch(com.commentableType) {
          case 'comment':
            focusById(com.commentableId);
            break;
          case 'subarticle':
            Subarticles.focusById(com.commentableId);
            break;
          case 'article':
            Navigate.go('app.article', { id: com.commentableId });
            break;
        }
      };

      var filter = {
        skip: 0,
        limit: 5,
        order: 'rating DESC'
      };

      var sortingFunction = function (a, b) {
        //Date descending
        a = new Date(a.created);
        b = new Date(b.created);
        var res = b - a;

        return res;
      };

      if (commentableType === 'comment') {
        filter.order = 'date DESC';
        spec.sortingFunction = sortingFunction;
      }

      if(!spec || !spec.options || !spec.options.id) {
        console.log('Cannot create a comment list without the parent id!');
        console.log('Please set spec.options.id');
        return;
      }

      spec.update = spec.update || update;
      spec.save = spec.save || save;
      spec.focus = spec.focus || focus;
      spec.destroy = spec.destroy || destroy;

      spec.options.filter = spec.options.filter || filter;
      spec.options.filter.where = spec.options.filter.where || filter.where;
      spec.options.filter.order = spec.options.filter.order || filter.order;
      spec.options.filter.limit = spec.options.filter.limit || filter.limit;

      var Model = Models[commentableType];
      if(!Model) {
        console.log(commentableType + ' is not a valid commentableType');
        return;
      }

      spec.find = Model.comments;

      // Create a list for articles within view
      var comments = list(spec);

      return comments;
    };

    var findById = function (id, cb) {
      Comment.findById({ id: id })
      .$promise
      .then(function(com) {
        var coms =  findOrCreate(com.commentableType, com.commentableId);
        coms.add(com);
        cb(coms);
      }, function (err) {
        console.log(err);
        cb();
      });
    };

    var focusById = function (id, cb) {
      cb = cb || function () {};

      Platform.loading.show();
      findById(id, function(coms) {
        if(coms) {
          coms.focusById(id);
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
