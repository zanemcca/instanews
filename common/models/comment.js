var common = require('./common');

module.exports = function(Comment) {

   common.initVotes(Comment);

   var staticDisable = [
      'create',
      'find',
      'exists',
      'upsert',
      'updateAll',
      'findById'
   ];

   var nonStaticDisable = [
      '__get__commentable',
      '__delete__comments'
   ];

   common.disableRemotes(Comment,staticDisable,true);
   common.disableRemotes(Comment,nonStaticDisable,false);

   //TODO Change this to use opertion hooks since model hooks are depricated
   Comment.beforeValidate = function(next) {

      if (!this.myId) {
         this.myId = Math.floor(Math.random()*Math.pow(2,32));
      }

      if (!this.username) this.username = 'bob';

      this.date =  Date.now();

      /*
      if (!this._votes) {
         this._votes = {
               up: 0,
               down: 0,
               lastUpdated: Date.now()
         };
      }
      */
      next();
   };
};
