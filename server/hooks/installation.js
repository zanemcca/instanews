
module.exports = function(app) {

   var Installation = app.models.installation;
  var debug = app.debug('hooks:installation');

   Installation.observe( 'before save' , function(ctx, next) {
     debug('before save', ctx, next);

      var inst = ctx.instance;

      /* istanbul ignore else */
      if( inst && ctx.isNewInstance) {

        inst.created = new Date();

         Installation.find({
            where: {
               deviceType: inst.deviceType,
               deviceToken: inst.deviceToken
            }
         }, function(err, res) {
            if( err) {
              console.error(err.stack);
              next(err);
            } else {
               if( res.length === 1) {

                  res[0].modified = new Date();
                  res[0].userId = inst.userId;
                  //Possibly an infinite loop here
                  /*
                  console.log('Installation was found so ' +
                     'updating it instead of creating a new one');
                     */
                  Installation.upsert(res[0], function(err, res) {
                     if (err) {
                       console.error(err.stack);
                       next(err);
                     } else {
                       console.log('Installation update was successful');
                       var err = new Error('Installation already exists. Updating instead');
                       err.status = 200;
                       next(err);
                     }
                  });
               }
              /* istanbul ignore else */
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
