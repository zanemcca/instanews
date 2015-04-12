
module.exports = function(app) {

   var Notification = app.models.notification;
   var Push = app.models.push;
   var Vote = app.models.vote;

   var badge = 1;
   Vote.observe('after save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst) {

         console.log('Starting push ...');

         var note = Notification({
            username: inst.__data.username,
            expirationInterval: 3600, //Expire in 1 hr
            badge: badge++,
            sound: 'ping.aiff',
            message: '\u270C\u2764\u263A ' + 'You just voted on some shit!!',
            messageFrom: 'zane'
         });

         console.log('Push Notification created : ', note);

         //TODO Store the notifications on a db
         Push.notifyByQuery({ userId: note.username} , note, function(err, res) {
            if (err) {
               console.log('Error pushing notification: ' + err);
            }
            console.log('Pushing notification to ', inst.__data.username);
         });
      }
      next();
   });

   /*
   Vote.observe('before save', function(ctx, next) {
      var inst = ctx.instance;
      if (inst) {
      }

      next();
   });
   */
}
