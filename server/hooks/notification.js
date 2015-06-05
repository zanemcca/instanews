
module.exports = function(app) {

   var Notification = app.models.notif;
   var Installation = app.models.installation;
   var Push = app.models.push;

   Notification.observe('after save', function(ctx, next) {
      var note = ctx.instance;
      if (note && ctx.isNewInstance) {

         //Find all installations for the given user
         Installation.find({
            where: {
               userId: note.username
            }
         }, function(err, res) {
            if (err)
               console.log('Error finding installation!: ' + err);
            else {
               if( res.length > 0) {

                  var report = function(err) {
                     if (err) {
                        console.log('Error pushing notification: ' + err);
                     }
                     //console.log('Pushing notification to ', note.username);
                  };

                  for(var i = 0; i < res.length; i++) {

                     if(res[i].deviceType === 'android') {
                        note.installationId = res[i].id;
                        note.deviceType = res[i].deviceType;
                        note.deviceToken = res[i].deviceToken;
                        note.expirationInterval = 3600; //Expire in 1 hr
                     }
                     else if (res[i].deviceType === 'ios') {
                        note.installationId = res[i].id;
                        note.deviceType = res[i].deviceType;
                        note.deviceToken = res[i].deviceToken;
                        note.expirationInterval = 3600; //Expire in 1 hr
                        note.badge =  1;
                        note.sound = 'ping.aiff';
                        note.alert =  note.message;
                     }
                     else {
                        console.log('Unkown device! Not pusing a notification');
                        break;
                     }
                     //console.log('Creating notification: ' + note.toString());

                     //Push the notification
                     Push.notifyById(res[i].id , note, report);
                  }
               }
               else {
                //  console.log('No devices found for ' + username);
               }
            }
         });
      }
      next();
   });

   Notification.observe('before save', function(ctx, next) {
      var note = ctx.instance;
      if(!note) {
         note = ctx.data;
      }

      if (note) {
         if(ctx.isNewInstance) {
            note.date = Date.now();
         }
         note.modified = Date.now();
      }
      next();
   });
};
