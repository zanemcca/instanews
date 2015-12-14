
var common = require('./common');

module.exports = function(Article) {

  common.initBase(Article);

  Article.clearPending = function (id, next) {
    //Find the article if it has a pending flag
    Article.findById(id, {
      pending: {
        exists: true
      }
    }, function (err, res) {
      if(err) {
        console.error('Failed to find clear pending flag for article ' + id);
        console.error(err);
        next(err);
      } else if(res) {
        res.updateAttributes({
          $unset: {
            pending: ''
          }
        }, function (err, res) {
          if(err) {
            console.error('Failed to find clear pending flag for article ' + id);
            console.error(err);
            return next(err);
          } else {
            console.log('Successfully cleared the pending flag on the article');
            next();
          }
        });
      }
      // istanbul ignore else
      else {
        console.log('The pending flag on the article has already been cleared');
        next();
      }
    });
  };

  Article.readModifyWrite = function(query, modify, cb, options) {
    common.readModifyWrite(Article, query, modify, cb, options);
  };

  Article.getHeatMap = function (box, cb) {
    console.dir(box);
    Article.find({
      limit: 500,
      fields: {
        id: true,   // Workaround for loopback-datasource-juggler bug in PR 704
        location: true,
        rating: true
      },
      where: {
        location: {
          geoWithin: {
            $box: box
          }
        }
      },
      order: 'rating DESC'
    }, function (err, res) {
      // istanbul ignore if
      if(err) {
        console.error('Failed to find articles for the heatmap!');
        console.error(err.stack);
      } else {
        console.log('Found ' + res.length + ' articles for the heatmap');
        cb(null, res);
      }
    });
  };

  Article.remoteMethod(
    'getHeatMap',
    {
      accepts: { arg: 'box', type: 'array'},
      returns: { arg: 'data', type: 'array'}
    }
  );

  var staticDisable = [
    'exists',
    'count',
    'findOne',
    'findById',
    'upsert',
    //'prototype.updateAttributes',
    'deleteById',
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
    //disable most subarticles REST endpoints
    '__delete__subarticles',
    '__destroyById__subarticles',
    '__findById__subarticles',
    '__updateById__subarticles',
    '__count__subarticles',
    //disable all journalist REST endpoints
    '__get__journalist',
    '__get__journalists',
    '__delete__journalists',
    '__destroyById__journalists',
    '__findById__journalists',
    '__create__journalists',
    '__updateById__journalists',
    '__count__journalists',
    '__exists__journalists',
    '__unlink__journalists',
    '__link__journalists',
  ];

  common.disableRemotes(Article,staticDisable,true);
  common.disableRemotes(Article,nonStaticDisable,false);
};
