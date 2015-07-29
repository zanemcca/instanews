
module.exports = function(app) {

   var Installation = app.models.installation;

   Installation.observe( 'before save' , function(ctx, next) {

      var inst = ctx.instance;

      if( inst && ctx.isNewInstance) {

        inst.created = new Date();

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
                  /*
                  console.log('Installation was found so ' +
                     'updating it instead of creating a new one');
                     */
                  Installation.upsert(res[0], function(err, res) {
                     if (err) next(err);
                     else {
                        //console.log('Installation update was successful');
                     }

                     var error = new Error();
                     error.message = 'Device is already installed. Updating';

                     next(error);
                  });
               }
               else if (res.length > 1) {
                  console.log('Error: There should only be one installation ' +
                        'per unique device but ' +
                        res.length + ' were found!');

                  var error = new Error();
                  error.message = 'Error: This device already' +
                     'has multiple installations';

                  ctx.res.status(500);
                  next(error);
               }
               else {
                  /*console.log('Device installation not found.'+
                        'Creating a new one');
                        */
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
