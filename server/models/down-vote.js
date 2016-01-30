
var common = require('./common');

module.exports = function(DownVote) {
  DownVote.notify = common.notify.bind(this, DownVote);

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

   common.disableRemotes(DownVote,staticDisable,true);
   common.disableRemotes(DownVote,nonStaticDisable,false);
};
