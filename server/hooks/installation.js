
module.exports = function(app) {

   var Installation = app.models.installation;

   Installation.observe( 'before save' , function(ctx, next) {

      var inst = ctx.instance;

      if( inst && ctx.isNewInstance) {

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
                  console.log('Installation was found so ' +
                     'updating it instead of creating a new one');
                  Installation.upsert(res[0], function(err, res) {
                     if (err) next(err);
                     else {
                        console.log('Installation update was successful');
                     }
                     next('Warning: ' +
                        'Device is already installed. Updated it instead');
                  });
               }
               else if (res.length > 1) {
                  console.log('Error: There should only be one installation ' +
                        'per unique device but ' +
                        res.length + ' were found!');
                  next('Error: This device already has multiple installations');
               }
               else {
                  console.log('Device installation not found.'+
                        'Creating a new one');
                  next();
               }
            }
         });

      }
      else {
         next();
      }
   });
};
