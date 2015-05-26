
var common = require('./common');

module.exports = function(Installation) {

   var staticDisable = [
      'exists',
      'count',
      'findOne',
      'findById',
      'upsert',
      'find',
      'prototype.updateAttributes',
      'deleteById',
      'findByApp',
      'findBySubscriptions',
      'findByUser',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable journalist REST endpoint
      '__get__journalist',
   ];

   common.disableRemotes(Installation,staticDisable,true);
   common.disableRemotes(Installation,nonStaticDisable,false);
};
