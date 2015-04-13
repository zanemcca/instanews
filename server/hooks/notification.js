
module.exports = function(app) {

   var Notification = app.models.notification;
   var Push = app.models.push;

   Notification.observe('after save', function(ctx, next) {
      var note = ctx.instance;
      if (note && ctx.isNewInstance) {

         Push.notifyById( note.__data.installationId , note, function(err) {
            if (err) {
               console.log('Error pushing notification: ' + err);
            }
            console.log('Pushing notification to ', note.__data.username);

         });
      }
      next();
   });
};
