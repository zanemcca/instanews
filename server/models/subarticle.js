var common = require('./common');

module.exports = function(Subarticle) {

  common.initBase(Subarticle);

  //TODO Use bind instead of this crud
  Subarticle.readModifyWrite = function(query, modify, cb, options) {
    common.readModifyWrite(Subarticle, query, modify, cb, options);
  };

  Subarticle.notify = common.notify.bind(this, Subarticle);

  Subarticle.clearPending = function(message, next) {
    var debug = Subarticle.app.debug('models:subarticle');
    var dd = Subarticle.app.DD('Subarticle','clearPending');
    var Article = Subarticle.app.models.Article;
    var Storage = Subarticle.app.models.Storage;

    debug('clearPending', message);

    Subarticle.findOne({
      where: {
        pending: message.jobId
      }
    }, function (err, res) {
      dd.lap('Subarticle.findOne');
      if(err) {
        console.log('Failed to find the subarticle');
        return next(err);
      }

      if(res) {
        var query = {
          $unset: {
            pending: ''
          }
        };

        if(res._file) {
          if(res._file.type.indexOf('video') > -1) {
            var sources = [];
            for(var i in message.outputs) {
              var src = message.outputs[i];
              sources.push({
                name: src.Key,
                duration: src.DurationMillis,
                width: src.Width,
                height: src.Height,
                size: src.FileSize
              });
            }

            if(sources.length) {
              query.$set = {
                '_file.sourceMetadata': sources
              };
            }
          } else if(res._file.type.indexOf('image') > -1) {
            if(message.sources) {
              query.$set = {
                '_file.sources': message.sources 
              };
            } else {
              var e = new Error('Invalid message! Cannot clear pending flag for ' + res.id + ' subarticle');
              e.status = 400;
              console.error(e);
              console.dir(message);
              return next(e);
            }
          }
        }

        var parentId = res.parentId;
        Subarticle.notify(res);

        debug('updateAttributes', query);
        res.updateAttributes(query, function (err, result) {
          dd.lap('Subarticle.updateAttributes');
          if(err) {
            console.error('Failed to update attributes!');
            return next(err);
          }

          Article.clearPending(parentId, function (err) { 
            dd.lap('Article.clearPending');
            if(err) {
              console.error('Failed to clear article pending flag!');
              return next(err);
            }

            if(res._file.type.indexOf('video') > -1) {
              var srcs = res._file.sources.slice();
              srcs.push(res._file.poster);
              Storage.updateCacheControl('instanews-videos', srcs, function(err) {
                dd.lap('Storage.updateCacheControl');
                next(err);
              });
            } else {
              next();
            }
          });
        });
      } else {
        console.log('No Subarticle found with pending: ' + message.jobId);
        return next();
      }
    });
  };

  //NOTE Deletion of multiple objects in a single requres implies that the parent will be deleted
  // as well and therefore it does not rerank the parent in this case. If batch deletion is needed then 
  // this dependency must be modified.

  var staticDisable = [
    'exists',
    'create',
    'find',
    'count',
    'findOne',
    'upsert',
    //     'prototype.updateAttributes',
    //     'deleteById',
    'createChangeStream',
    'createChangeStream_0',
    'updateAll'
  ];

  var nonStaticDisable = [
    //disable all comment REST endpoints
    //      '__get__comments',
    '__delete__comments',
    '__destroyById__comments',
    '__findById__comments',
    '__create__comments',
    '__updateById__comments',
    '__count__comments',
    //disable all clicks REST endpoints
    '__get__clicks',
    '__delete__clicks',
    '__destroyById__clicks',
    '__findById__clicks',
    '__create__clicks',
    '__updateById__clicks',
    '__count__clicks',
    //disable all views REST endpoints
    '__get__views',
    '__delete__views',
    '__destroyById__views',
    '__findById__views',
    '__create__views',
    '__updateById__views',
    '__count__views',
    //disable all upvote REST endpoints
    '__get__upVotes',
    '__delete__upVotes',
    '__destroyById__upVotes',
    '__findById__upVotes',
    '__create__upVotes',
    '__updateById__upVotes',
    '__count__upVotes',
    //disable all downvote REST endpoints
    '__get__downVotes',
    '__delete__downVotes',
    '__destroyById__downVotes',
    '__findById__downVotes',
    '__create__downVotes',
    '__updateById__downVotes',
    '__count__downVotes',
    //disable all file REST endpoints
    '__get__file',
    '__destroy__file',
    '__create__file',
    '__update__file',
    //disable the article REST endpoint
    '__get__article',
    //disable the journalist REST endpoint
    '__get__journalist'
  ];

  common.disableRemotes(Subarticle,staticDisable,true);
  common.disableRemotes(Subarticle,nonStaticDisable,false);


};

