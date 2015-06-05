
module.exports = function(app) {

   var Journalist = app.models.journalist;


   Journalist.afterRemote('prototype.__get__articles',
   function(ctx, instance, next) {

      //Automatically remove all duplicate articles
      //Duplicates can be present since the articles associated
      //with a journalist come through their subarticles
      var uniqueIds = [];
      for(var i = 0; i < instance.length; i++) {
         if(uniqueIds.indexOf(instance[i].id) > -1 ) {
            instance.splice(i,1);
            i--;
         }
         else {
            uniqueIds.push(instance[i].id);
         }
      }


      next();
   });

   Journalist.observe('access', function(ctx, next) {
      ctx.query.fields = {
         email: false,
         password: false
      };
      next();
   });
};
