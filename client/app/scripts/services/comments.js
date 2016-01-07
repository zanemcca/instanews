
'use strict';

var app = angular.module('instanews.service.comments', ['ionic', 'ngResource']);

app.service('Comments', [
  'Article',
  'Subarticle',
  'Comment',
  'list',
  function(
    Article,
    Subarticle,
    Comment,
    list
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
          comments.remove(function (comment) {
            return (comment.id === id); 
          });
        },
        function (err) {
          console.log(err);
        });
      };

      var filter = {
        skip: 0,
        limit: 5,
        order: 'rating DESC'
      };

      if (commentableType === 'comment') {
        filter.order = 'date DESC';
      }

      if(!spec || !spec.options || !spec.options.id) {
        console.log('Cannot create a comment list without the parent id!');
        console.log('Please set spec.options.id');
        return;
      }

      spec.update = spec.update || update;
      spec.save = spec.save || save;
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

    return {
      findOrCreate: findOrCreate 
    };
  }
]);
