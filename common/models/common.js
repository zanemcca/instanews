
exports.disableRemotes = function(Model,list,isStatic) {
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
