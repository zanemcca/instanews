var common = require('./common');

module.exports = function(View) {
   var staticDisable = [
      'exists',
      'find',
      'count',
      'findOne',
      'findById',
      'upsert',
      'prototype.updateAttributes',
      'deleteById',
      'createChangeStream',
      'createChangeStream_0',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable all viewable REST endpoints
      '__get__viewable',
      //disable all clicks REST endpoints
      '__get__clicks',
      '__delete__clicks',
      '__destroyById__clicks',
      '__findById__clicks',
      '__create__clicks',
      '__updateById__clicks',
      '__count__clicks',
      //disable the journalist REST endpoint
      '__get__journalist'
   ];

   common.disableRemotes(View,staticDisable,true);
   common.disableRemotes(View,nonStaticDisable,false);
};
