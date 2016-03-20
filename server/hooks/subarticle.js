
var async = require('async');
/* jshint camelcase: false */

module.exports = function(app) {

   var Subarticle = app.models.subarticle;
   var Storage = app.models.storage;
   var File = app.models.file;
   var Click = app.models.click;
   var Article = app.models.Article;
   var Stat = app.models.stat;
   var Notification = app.models.notif;
  var Base = app.models.base;
  var debug = app.debug('hooks:subarticle');

  Subarticle.afterRemote('prototype.__get__comments', function(ctx, inst,next){
    var dd = app.DD('Subarticle','afterGetComments');
    ctx.options = {
      clickType: 'getComments'
    };
    debug('afterRemote __get__comments', ctx, inst, next);
    Base.createClickAfterRemote(
      ctx,
      // istanbul ignore next
      function (err) {
        dd.lap('Base.createClickAfterRemote');
      if(err) {
        console.error(err.stack);
      }
    });
    next();
  });

   Subarticle.observe('before save', function(ctx, next) {
      var dd = app.DD('Subarticle','beforeSave');
      debug('before save', ctx, next);
      var inst = ctx.instance;
      /* istanbul ignore else */
      if (inst && ctx.isNewInstance) {
        /* istanbul ignore else */
         if ( inst._file ) {
           File.beforeSave(inst._file, function (err) {
             dd.lap('File.beforeSave');
             if(err) {
               return next(err);
             } else {
               // Set the pending flag on the photo or video subarticle until 
               // completion of the transcoding
               if(inst._file.jobId) {
                 inst.pending = inst._file.jobId;
                 inst._file.unsetAttribute('jobId');
               }
               next();
             }
           });
         } else {
           next();
         }
      } else {
        next();
      }
   });

  /*
   * Unused due to deferred updates
  Subarticle.triggerRating = function(where, modify, cb) {
    debug('triggerRating', where, modify, cb);
    if(where && Object.getOwnPropertyNames(where).length > 0) {
      // Update rating updates the subarticles rating value in the db
      Stat.updateRating(where, Subarticle.modelName, modify,
      function(err, count) {
        if(err) {
          console.warn('Warning: Failed to update a subarticle');
          cb(err);
        }
        else {
          var query = {
            where: where,
            limit: 1
          };
          Subarticle.find(query, function(err, res) {
            if(err) {
              console.warn('Warning: Failed to find subarticle');
              cb(err);
            }
            else if(res.length > 0) {
              Article.triggerRating({
                id: res[0].parentId
              }, null, function(err, res) {
                cb(err, count);
              });
            } else {
              cb();
            }
          });
        }
      });
    } else {
      var error = new Error(
        'Invalid filter for comment.triggerRating: ' + where);
      console.error(error.stack);
      error.status = 400;
      cb(error);
    }
  };
 */

  Subarticle.observe('after save', function(ctx, next) {
    var dd = app.DD('Subarticle','afterSave');
    debug('after save', ctx, next);
    var inst = ctx.instance;
    if(!inst) {
      inst = ctx.data;
    }

    if(inst && ctx.isNewInstance) {
      Click.create({
        username: inst.username,
        type: 'createSubarticle',
        clickableType: 'article',
        clickableId: inst.parentId
      }, function(err, res) {
        dd.lap('Click.create');
        if(err) {
          console.error(
            'Error: Failed to create a click for subarticle creation');
          next(err);
        } else if(!inst._file) {
          Subarticle.notify(inst);

          Article.clearPending(inst.parentId, function(err) {
            dd.lap('Article.clearPending');
            if(err) {
              console.log('Failed to clear pending flag on article ' + inst.parentId);
              console.error(err);
            }
            next(err);
          });
        } else {
          next();
        }
      });
    }
    else {
      if(!inst) {
        console.warn('Warning: Instance is not valid for subarticle after save');
      }
      next();
    }
  });

  var deleteMedia = function (inst, next) {
    if(inst._file) {
      var container;
      var items;
      var waiting = 0;
      if(inst._file.type.indexOf('video') > -1) {
        container = 'instanews-videos';

        if(process.env.NODE_ENV !== 'production') {
          container += '-test';
        }

        items = inst._file.sources.slice(0);

        var processM3U8 = function (err, res) {
          if(err) {
            console.error(err);
          } else {
            var contents = res.Body.toString().split('\n');
            for(var i = 0 ; i < contents.length - 1; i++) {
              if(contents[i].indexOf('#EXTINF') === 0) {
                console.log(contents[i+1]);
                items.push(contents[i+1]);
              }
            }
          }
          waiting--;
        };
        //M3U8 holds a playlist of files. This reads the .m3u8 file and adds the playlist files to the list
        for(var i = 0; i < items.length; i++) {
          var name = items[i];
          if(name.indexOf('.m3u8') > -1) {
            waiting++;
            Storage.getObject({
              Bucket: container,
              Key: name
            }, processM3U8);
          }
        }
        // Add the poster
        if(inst._file.poster) {
          items.push(inst._file.poster);
        }
      } else {
        items = [];
        inst._file.sources.forEach(function(source) {
          items.push(source.prefix + '-' + inst._file.name);
        });

        container = 'instanews-photos';
        if(process.env.NODE_ENV !== 'production') {
          container += '-test';
        }
      }

      var done = function () {
        var functions = [];
        items.forEach(function(item) {
          functions.push(Storage.destroy.bind(Storage, container, item));
        });

        async.parallel(functions, function(err, res) {
          if(err) {
            console.log('Destroy failed!');
            console.log(items);
            console.error(err.stack);
          }
          next();
        });
      };

      var wait = function () {
        if(waiting) {
          setTimeout(wait, 1);
        } else {
          done();
        }
      };

      wait();
    } else {
      next();
    }
  };

  Subarticle.observe('before delete', function(ctx, next) {
    var dd = app.DD('Subarticle','beforeDelete');
    debug('before delete', ctx, next);
    Subarticle.find({ where: ctx.where }, function (err, res) {
      dd.lap('Subarticle.find');
      if(err) {
        console.error(err.stack);
        next(err);
      } else if(res.length > 0) {
        ctx.options = ctx.options || {};
        ctx.options.instances = res;

        res.forEach(function(inst) {
          Storage.archive(inst, function(err) {
            dd.elapsed('Storage.archive');
            if(err) {
              console.error('Failed to archive the item');
              console.error(inst);
              console.error(err.stack);
            } 

            inst.comments.destroyAll(function (err, res) {
              dd.elapsed('Subarticle.comments.destroyAll');
              if(err) {
                console.error('Failed to delete subarticles comments');
                console.error(err.stack);
              }

              var id = ctx.where.id || ctx.where._id;
              // Rerank the parent if this element was deleted individually 
              if(JSON.stringify(id) === JSON.stringify(inst.id)) {
                Base.deferUpdate(id, 'article', {
                  subarticle: true
                }, function(err) {
                  dd.elapsed('Base.deferUpdate');
                  if(err) {
                    console.log(err.stack);
                    return next(err);
                  }
                  deleteMedia(inst, function(err) {
                    dd.elapsed('Subarticle.delteMedia');
                    next(err);
                  });
                });
                /*
                inst.article(function (err, res) {
                  var data = {
                    $mul: {
                      'notSubarticleRating': 1/(1 - inst.rating)
                    },
                    $inc: {
                      'createSubarticleCount': -1
                    }
                  };

                  res.updateAttributes(data, function (err, res) {
                    if(err) {
                      console.error(err.stack);
                      return deleteMedia(inst, next);
                    }

                    Article.triggerRating({
                      id: res.id
                    }, null, function(err, res) {
                      if(err) {
                        console.log(err.stack);
                      }
                      deleteMedia(inst, next);
                    });
                  });
                });
                */
              } else {
                deleteMedia(inst, function(err) {
                  dd.elapsed('Subarticle.delteMedia');
                  next(err);
                });
              }
            });
          });
        });
      } else {
        next();
      }
    });
  });

  Subarticle.observe('after delete', function(ctx, next) {
    var dd = app.DD('Subarticle','afterDelete');
    debug('before delete', ctx, next);
    //If one subarticle was deleted then destroy the parent article
    if(ctx.options && ctx.options.instances && ctx.options.instances.length === 1) {
      var inst = ctx.options.instances[0];
      // Rerank the parent if this element was deleted individually 
      Subarticle.count({
        parentId: inst.parentId
      }, function (err, count) {
        dd.lap('Subarticle.count');
        if(err) {
          console.error('Failed to count subarticles');
          console.error(err.stack);
        }

        if(count === 0) {
            Article.destroyById(inst.parentId, function(err) {
              dd.lap('Article.destroyById');
              if(err) {
                console.error('Failed to delete subarticles article');
              }
              next(err);
            });
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
};
