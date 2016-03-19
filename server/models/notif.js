var common = require('./common');

module.exports = function(Notif) {

  Notif.setSeen = function (id, next) {
    var dd = Notif.app.DD('Notification', 'setSeen');
    var query = {
      where: {
        id: id,
      }
    };

    Notif.findOne(query, function (err, res) {
      dd.lap('Notification.findOne');
      if(err) {
        return next(err);
      }
      if(!res) {
        err = new Error('There is no notification under that search');
        err.status = 404;
        return next(err);
      } else if (!res.seen) {
        res.updateAttribute('seen', true, function (err, res) {
          dd.lap('Notification.updateAttribute');
          if(err) {
            return next(err);
          } else {
            Notif.app.models.Journalist.decrementBadge(res.username, function(err) {
              dd.lap('Journalist.decrementBadge');
              dd.elapsed();
              next(err);
            });
          }
        });
      } else {
        err = new Error('The notification has already been seen!');
        err.status = 403;
        return next(err);
      }
    });
  };

  Notif.remoteMethod(
    'setSeen',
    {
      accepts: { arg: 'id', type: 'string', required: true},
      http: {
        path: '/:id/seen', verb: 'put'
      }
    }
  );

   var staticDisable = [
      'exists',
      'find',
      'count',
      'findOne',
      'findById',
      'upsert',
      'create',
      'prototype.updateAttributes',
      'deleteById',
      'createChangeStream',
      'createChangeStream_0',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable all notifications REST endpoints
      '__get__notifiable',
      //disable the journalist REST endpoints
      '__get__from',
      '__get__to'
   ];

   common.disableRemotes(Notif,staticDisable,true);
   common.disableRemotes(Notif,nonStaticDisable,false);
};
