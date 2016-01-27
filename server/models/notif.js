var common = require('./common');

module.exports = function(Notif) {

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
