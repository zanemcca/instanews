var common = require('./common');

module.exports = function(Click) {

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
      //disable all clicks REST endpoints
      '__get__clickable',
      //disable all views REST endpoints
      '__get__view',
      //disable the journalist REST endpoint
      '__get__journalist'
   ];

   common.disableRemotes(Click,staticDisable,true);
   common.disableRemotes(Click,nonStaticDisable,false);
};
