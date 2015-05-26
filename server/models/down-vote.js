
var common = require('./common');

module.exports = function(DownVote) {

   var staticDisable = [
      'exists',
      'count',
      'findOne',
      'findById',
      'upsert',
      'find',
      'prototype.updateAttributes',
      'deleteById',
      'updateAll'
   ];

   var nonStaticDisable = [
      //disable journalist REST endpoint
      '__get__journalist',
      //disable votable relation finding
      '__get__votable'
   ];

   common.disableRemotes(DownVote,staticDisable,true);
   common.disableRemotes(DownVote,nonStaticDisable,false);
};
