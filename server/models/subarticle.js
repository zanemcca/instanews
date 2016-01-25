var common = require('./common');

module.exports = function(Subarticle) {

  common.initBase(Subarticle);

  Subarticle.readModifyWrite = function(query, modify, cb, options) {
    common.readModifyWrite(Subarticle, query, modify, cb, options);
  };

  Subarticle.clearPending = function(pendingId, next) {
    var Article = Subarticle.app.models.Article;

    Subarticle.findOne({
      where: {
        pending: pendingId
      }
    }, function (err, res) {
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

        console.log(res);
        if(message.sources) {
          query.$set = {
            '_file.sources': message.sources 
          };
        }

        var parentId = res.parentId;
        Subarticle.notify(res);

        res.updateAttributes(query, function (err, res) {
          if(err) {
            return next(err);
          }

          Article.clearPending(parentId, next);
        });
      } else {
        console.log('No Subarticle found with pending: ' + message.jobId);
        return next();
      }
    });
  };

  Subarticle.notify = function (inst) {
    var Notification = Subarticle.app.models.notif;

    //Find all subarticles associated with this article
    Subarticle.find({
      where: {
        parentId: inst.parentId
      }
    }, function(err, res) {
      //Error checking
      if(err) {
        console.error(err.stack);
      } else {

        var report = function(err, res) {
          if (err) {
            console.error(err.stack);
          } else {
            //console.log('Created a notification!');
          }
        };


        Notification.create({
          message: 'Your subarticle is ready',
          notifiableId: inst.id,
          notifiableType: 'subarticle',
          messageFrom: inst.username,
          username: inst.username
        }, report);

        //List of already notified users
        var users = [
          inst.username
        ];
        for( var  i = 0; i < res.length; i++) {
          if ( users.indexOf(res[i].username) === -1) {
            //Send a notification to each user
            //associated with the parent article
            var username = res[i].username;
            var message = inst.username +
              ' collaborated with you on an article';

              Notification.create({
                message: message,
                notifiableId: inst.parentId,
                notifiableType: 'article',
                messageFrom: inst.username,
                username: username
              }, report);

              users.push(res[i].username);
          }
        }
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

