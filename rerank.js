'use strict';

var Stat = {
  app: {
    DD: function() {
      return {
        histogram: () => {}
      };
    }
  }
};

require('./server/models/stat.js')(Stat);

var cred = require('./server/conf/credentials');

var mongo = cred.get('mongo');
var mongoCA = cred.get('mongoCA');

var mongodb = '';
if( mongo.username && mongo.password) {
  mongodb += mongo.username +
  ':' + mongo.password;
}

mongodb  += mongo.url;

var options = {
  connectTimeoutMS: 30000
};

if(mongo.replicaSet) {
  options.replicaSet = mongo.replicaSet;
}

if(mongo.ssl && mongoCA) {
  options = {
    ssl: true,
    sslValidate: true,
    sslCA: [mongoCA],
  };
}

console.log(mongodb);
console.log(options);

const db = require('monk')(mongodb + 'articles', options);
const articles = db.get('article');
const comments = db.get('comment');
const subarticles = db.get('subarticle');

function getNotComRating(query, cb) {
  comments.find(query).then( (coms) => {
    processItems(coms, cb);
  }, (err) => {
    console.error(err);
    cb(NaN);
  });
}

function processItems(items, cb) {
  function *processGenerator() {
    var notRating = 1;
    for(var item of items) {
      yield process(item, function(rating) {
        notRating *= (1 - rating);
        Processor.next();
      });
    }

    cb(notRating);
  }
  var Processor = processGenerator();
  Processor.next();
}

function cleanseItem(item) {
  var props = [
    'upVoteCount',
    'downVoteCount',
    'clickCount',
    'getSubarticlesCount',
    'createSubarticleCount',
    'getCommentsCount',
    'createCommentCount',
    'notCommentRating',
    'notSubarticleRating',
    'rating',
    'ratingVersion',
    'version',
    'viewCount'
  ];

  var properties = Object.getOwnPropertyNames(item);
  for(var property of properties) {
    if(props.indexOf(property) > -1) {
      if(typeof(item[property]) !== 'number') {
        item[property] = 0;
      }
    }
  }
  return item;
}

function process(model, cb) {
  cleanseItem(model);
  console.log('processing: ' + model.modelName);
  switch(model.modelName) {
    case 'article':
      subarticles.find({
        parentId: model._id
      }).then((subs) => {
        processItems(subs, (notSubRating) => {
          if(isNaN(notSubRating)) {
            console.error('Failed to update the rating of the subarticles for article ' + model._id);
            return cb(NaN);
          }

          getNotComRating({
            commentableId: model._id,
            commentableType: model.modelName
          }, (notComRating) => {

            if(isNaN(notComRating)) {
              console.error('Failed to update the rating of the comments for article ' + model._id);
              return cb(NaN);
            }

            model.notSubarticleRating = notSubRating;
            model.notCommentRating = notComRating;
            var rating = Stat.getRating(model);
            articles.update({ _id: model._id },{ 
              $set: {
                notSubarticleRating: notSubRating,
                notCommentRating: notComRating,
                rating: rating,
                ratingModified: new Date(),
              },
              $inc: {
                ratingVersion: 1
              }
            }).then(function() {
              //console.log('Model: ' + model.modelName + '\tRating: ' + rating);
              cb(rating);
            });
          });
        });
      });
      break;
    case 'subarticle':
      getNotComRating({
        commentableId: model._id,
        commentableType: model.modelName
      }, (notComRating) => {

        if(isNaN(notComRating)) {
          console.error('Failed to update the rating of the comments for subarticle ' + model._id);
          return cb(NaN);
        }

        model.notCommentRating = notComRating;
        var rating = Stat.getRating(model);
        subarticles.update({ _id: model._id },{
          $set: {
            notCommentRating: notComRating,
            rating: rating,
            ratingModified: new Date(),
          },
          $inc: {
            ratingVersion: 1
          }
        }).then(function() {
          //console.log('Model: ' + model.modelName + '\tRating: ' + rating);
          cb(rating);
        });
      });
      break;
    case 'comment':
      var finish = function(isReply) {
        var rating = Stat.getRating(model);
        var updates = {
          $set: {
            rating: rating,
            ratingModified: new Date(),
          },
          $inc: {
            ratingVersion: 1
          }
        };

        if(!isReply) {
          updates.$set.notCommentRating = model.notCommentRating;
        }
        comments.update({ _id: model._id }, updates).then(function() {
          //console.log('Model: ' + model.modelName + '\tRating: ' + rating);
          cb(rating);
        });
      };

      if(model.commentableType !== 'comment') {
        getNotComRating({
          commentableId: model._id,
          commentableType: model.modelName
        }, (notComRating) => {
          if(isNaN(notComRating)) {
            console.error('Failed to update the rating of the comments for comment ' + model._id);
            return cb(NaN);
          }

          model.notCommentRating = notComRating;
          finish(false);
        });
      } else {
        finish(true);
      }
      break;
    default:
      console.error('Unknown model name: ' + model.modelName);
      console.log(model);
      cb(NaN);
      break;
  }
}

console.log('Finding articles');
articles.find({}).then((articles) => {
  console.log('Processing all articles');
  processItems(articles, function(notArticleRating) {
    console.log('Completed processing  Rating = ' + (1 - notArticleRating));
  });
});
