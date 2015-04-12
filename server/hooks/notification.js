
module.exports = function(app) {

   /*
   var Notification = app.models.notification;
   var Push = app.models.push;

   Notification.observe('before save', function(ctx, next) {
      var note = ctx.instance;
      if (note) {

         console.log('Push Notification created : ', note);

         Push.notifyByQuery({ userId: note.__data.username} , note, function(err) {
            if (err) {
               console.log('Error pushing notification: ' + err);
            }
            console.log('Pushing notification to ', note.__data.username);

         });
      }
      next();
   });
   */

   /*
   Vote.observe('before save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst) {
      }

      next();
   });
   */
}
