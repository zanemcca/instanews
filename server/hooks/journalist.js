
module.exports = function(app) {

   var Journalist = app.models.journalist;

   Journalist.afterRemote('prototype.__get__articles',
   function(ctx, instance, next) {

      //Automatically remove all duplicate articles
      //Duplicates can be present since the articles associated
      //with a journalist come through their subarticles
      var uniqueIds = [];
      for(var i = 0; i < instance.length; i++) {
         if(uniqueIds.indexOf(instance[i].myId) > -1 ) {
            instance.splice(i,1);
            i--;
         }
         else {
            uniqueIds.push(instance[i].myId);
         }
      }

      next();
   });

   Journalist.observe('access', function(ctx, next) {
      ctx.query.fields = {
         password: false,
         email: false
      }
      next();
   });
};
