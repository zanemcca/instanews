
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
