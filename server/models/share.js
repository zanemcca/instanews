
var common = require('./common');

module.exports = function(Share) {

  Share.notify = common.notify.bind(this, Share);

   var staticDisable = [
      'exists',
      'count',
      'findOne',
      'findById',
      'upsert',
      'find',
      'prototype.updateAttributes',
      'deleteById',
      'createChangeStream',
      'createChangeStream_0',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable journalist REST endpoint
      '__get__journalist',
      //disable clickable relation finding
      '__get__clickable',
      //disable view relation finding
      '__get__view'
   ];

   common.disableRemotes(Share,staticDisable,true);
   common.disableRemotes(Share,nonStaticDisable,false);
};
