
module.exports = function(app) {

   var Installation = app.models.installation;
  var debug = app.debug('hooks:installation');

   Installation.observe( 'before save' , function(ctx, next) {
     debug('before save', ctx, next);

      var inst = ctx.instance;

      if( inst && ctx.isNewInstance) {

        inst.created = new Date();

         Installation.find({
            where: {
               deviceType: inst.__data.deviceType,
               deviceToken: inst.__data.deviceToken
            }
         }, function(err, res) {
            if( err) console.error(err.stack);
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
                  var error = new Error('Error: There should only be one installation ' +
                        'per unique device but ' +
                        res.length + ' were found!');
                  error.status = 403;
                  console.error(error.stack);
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
