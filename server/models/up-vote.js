
var common = require('./common');

module.exports = function(UpVote) {

  UpVote.notify = common.notify.bind(this, UpVote);

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

   common.disableRemotes(UpVote,staticDisable,true);
   common.disableRemotes(UpVote,nonStaticDisable,false);
};
