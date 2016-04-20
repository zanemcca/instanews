
var ONE_DAY = 24*60*60*1000; // 1 Day in millisecs
var ONE_WEEK = 7*ONE_DAY; // 1 Week in millisecs
var ONE_MONTH = 30*ONE_DAY; // 1 Month in millisecs

var common = require('./common');

module.exports = function(Article) {

  common.initBase(Article);

  Article.clearPending = function (id, next) {
    var dd = Article.app.DD('Article', 'clearPending');
    //Find the article if it has a pending flag
    Article.findById(id, {
      pending: {
        exists: true
      }
    }, function (err, res) {
      dd.lap('Article.findById');
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
           dd.lap('Article.updateAttributes');
           if(err) {
            console.error('Failed to find clear pending flag for article ' + id);
            console.error(err);
            return next(err);
          } else {
            next();
          }
         });
      } 
      // istanbul ignore else
      else {
        next();
      } 
    });
  };

  Article.readModifyWrite = function(query, modify, cb, options) {
    common.readModifyWrite(Article, query, modify, cb, options);
  };

  const LNG = 0;
  const LAT = 1;
  var normalizeCoords = function(coords) {
    var res = [0, 0];
    res[LNG] = coords[LNG];

    // Bring the latitude to within +- 180 deg
    res[LAT] = coords[LAT] % 360;  
    if(res[LAT] > 180) {
      res[LAT] -= 360;
    }

    // Add a half rotation to the lng if |lat| > 90 and then correct the lat +- 90 deg
    if(res[LAT] > 90) {
      res[LAT] = 180 - coords[LAT];
      res[LNG] += 180;
    } else if(res[LAT] < -90) {
      res[LAT] = - 180 - coords[LAT];
      res[LNG] += 180;
    }

    // Bring longitude to within +- 180 deg
    res[LNG] = res[LNG] % 360;
    if(res[LNG] >= 180) {
      res[LNG] -= 360;
    }

    return res;
  };

  var additionalPointsNeeded = function(lat, lng1, lng2) {
    var precision = 0.5; //In degrees latitude

    var x = lat*Math.PI/180;
    var y = (lng1 - lng2)*Math.PI/360;
    var n = 0;
    var delta = 361;

    while(delta > precision) {
      n++;
      var latMax = Math.atan(Math.tan(x)/Math.cos(y/n))*180/Math.PI;
      delta = Math.abs(latMax - lat);
    }

    return Math.pow(2, n-1) -1;
  };

  Article.generateBoxGeometry = function(sw, ne) {
    var geometry = {
      type: 'Polygon',
      coordinates: [],
      crs: {
        type: "name",
        properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
      }
    };

    var pBottom = additionalPointsNeeded(sw[LAT], sw[LNG], ne[LNG]);
    var pTop = additionalPointsNeeded(ne[LAT], sw[LNG], ne[LNG]);

    var coords = [];
    var lng;

    for(var i = 0; i < pBottom + 2; i++) {
      lng = sw[LNG] + (i/(pBottom + 1))*(ne[LNG] - sw[LNG]);
      coords.push([lng , sw[LAT]]);
    }

    for(var j = 0; j < pTop + 2; j++) {
      lng = ne[LNG] - (j/(pTop + 1))*(ne[LNG] - sw[LNG]);
      coords.push([lng , ne[LAT]]);
    }

    coords.push(sw.slice());

    geometry.coordinates.push(coords);

    return geometry;
  };

  Article.heatMap = function (box, cb) {
    var debug = Article.app.debug('models:article');
    var dd = Article.app.DD('Article', 'heatMap');

    var sw, ne;
    try { 
      sw = normalizeCoords(JSON.parse(box[0]));
      ne = normalizeCoords(JSON.parse(box[1]));
    } catch(e) {
      console.warn('Invalid box given!');
      console.warn(e);
      var err = new Error('Malformed input!');
      err.status = 422;
      return cb(err);
    }

    var geometry = Article.generateBoxGeometry(sw, ne);

    Article.find({
      limit: 500,
      fields: {
        id: true,   // Workaround for loopback-datasource-juggler bug in PR 704
        loc: true,
        rating: true
      },
      where: {
        loc: {
          geoWithin: {
            $geometry: geometry 
          }
        },
        pending: {
          exists: false
        },
        id: {
          gt: Article.app.utils.objectIdWithTimestamp(Date.now() - 2 * ONE_WEEK)
        }
      },
      order: 'rating DESC'
    }, function (err, res) {
      dd.lap('Article.find');
      dd.elapsed();
      // istanbul ignore if
      if(err) {
        console.error('Failed to find articles for the heatmap!');
        console.error(err.stack);
        cb(err);
      } else {
        debug('getHeatMap', res.length);
        cb(null, res);
      }
    });
  };

  Article.remoteMethod(
    'heatMap',
    {
      accepts: { arg: 'box', type: 'array', required: true},
      http: {
        path: '/heatMap', verb: 'get'
      },
      description: 'Accepts an array in the following form [[sw-lng, sw-lat],[ne-lng, ne-lat]] and returns the top articles contained within the rectangle',
      returns: { arg: 'data', type: 'array'}
    }
  );

   Article.getHeatMap = function (box, cb) {
    var debug = Article.app.debug('models:article');
    var dd = Article.app.DD('Article', 'getHeatMap');
    console.warn('Article.getHeatMap has been deprecated. Please use Article.heatMap!');

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
        },
        pending: {
          exists: false
        },
        id: {
          gt: Article.app.utils.objectIdWithTimestamp(Date.now() - 2 * ONE_WEEK)
        }
      },
      order: 'rating DESC'
    }, function (err, res) {
      dd.lap('Article.find');
      dd.elapsed();
      // istanbul ignore if
      if(err) {
        console.error('Failed to find articles for the heatmap!');
        console.error(err.stack);
        cb(err);
      } else {
        debug('getHeatMap', res.length);
        cb(null, res);
      }
    });
  };

  Article.remoteMethod(
    'getHeatMap',
    {
      accepts: { arg: 'box', type: 'array'},
      description: 'DEPRECATED',
      returns: { arg: 'data', type: 'array'}
    }
  );

  var staticDisable = [
    'exists',
    'count',
    'findOne',
 //   'findById',
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
