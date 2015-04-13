
 var disableRemotes = function(Model,list,isStatic) {
   /*
   if (isStatic) {
      console.log('\nDisabling staic remote methods on ' + Model.modelName);
   }
   else {
      console.log('\nDisabling nonStatic remote methods on ' + Model.modelName);
   }*/

   for(var i = 0; i < list.length; i++) {
      var method = list[i];
      //console.log('\tDisabling ' + method);
      Model.disableRemoteMethod(method, isStatic);
   }
};

/*
exports.upvote = function(Model,cb) {
   Model._votes.up++;
   var currentTime = Date.now();

   //Update the instantaneous rate
   Model._votes.rate = 1/(currentTime - Model._votes.lastUpdated);
   Model._votes.lastUpdated = currentTime;
   Model._votes.rating = Model._votes.up - Model._votes.down;
   Model.save(cb);
};

exports.downvote = function(Model,cb) {
   Model._votes.down++;
   var currentTime = Date.now();

   //Update the instantaneous rate
   Model._votes.rate = -1/(currentTime - Model._votes.lastUpdated);
   Model._votes.lastUpdated = currentTime;
   Model._votes.rating = Model._votes.up - Model._votes.down;
   Model.save(cb);
};
*/

var initVotes = function(Model) {
   var staticDisable = [
   ];

   var nonStaticDisable = [
      '__updateById__upVotes',
      '__delete__upVotes',
      '__delete__downVotes',
      '__updateById__downVotes'
   ];

   disableRemotes(Model,staticDisable,true);
   disableRemotes(Model,nonStaticDisable,false);
};

exports.initVotes = initVotes;
exports.disableRemotes = disableRemotes;
