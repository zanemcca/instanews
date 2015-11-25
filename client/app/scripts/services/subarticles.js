
'use strict';

var app = angular.module('instanews.service.subarticles', ['ionic', 'ngResource']);

app.service('Subarticles', [
  'Article',
  'list',
  function(
    Article,
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
          oldValue.upVotes = newValue.upVotes;
          oldValue.version = newValue.version;
          oldValue.text = newValue.text;
          oldValue._file = newValue._file;
        }
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
      spec.update = spec.update || update;

      // Create a list for articles within view
      var subarticles = list(spec);

      return subarticles;
    };

    return {
      findOrCreate: findOrCreate 
    };
  }
]);
