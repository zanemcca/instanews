
module.exports = function(app) {

   var Installation = app.models.installation;


//   Installation.validatesUniquenessOf('deviceToken', {message: 'Device token is not unique!'});

   Installation.observe( 'before save' , function(ctx, next) {

      var inst = ctx.instance;

      if( inst ) {
         /*
          * If we need more complicated validation then this will be how to do it
          * For now I am just using find to check since validation does a find anyway
          * it would just be redundent to use isValid with find nested inside
         inst.isValid( function (valid) {
            if (!valid) {
               console.log('This device is already installed');
               console.log('Updating the installation instead');
               console.log('Errors: ' + inst.errors);
            }
            else {
               console.log('Saving an installation: ', inst);
               next();
            }
         });
            */

         Installation.find({
            where: {
               deviceType: inst.__data.deviceType,
               deviceToken: inst.__data.deviceToken
            }
         }, function(err, res) {
            if( err) console.log(err);
            else {
               if( res.length === 1) {

                  res[0].modified = new Date();
                  res[0].userId = inst.userId;
                  //Possibly an infinite loop here
                  console.log('Installation was found so updating it instead of creating a new one');
                  Installation.upsert(res[0], function(err, res) {
                     if (err) next(err);
                     else {
                        console.log('Installation update was successful');
                     }
                     next('Warning: Device is already installed. Updated it instead');
                  });
               }
               else if (res.length > 1) {
                  console.log('Error: There should only be one installation per unique device but '
                        + res.length + ' were found!');
                  next('Error: This device already has multiple installations');
               }
               else {
                  console.log('Device installation not found so it must be ok');
                  next();
               }
            }
         });

      }
      else {
         console.log('Installation instance is not present so it must be an update');
         next();
      }
   });
}
