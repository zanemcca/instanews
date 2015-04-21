

var notifyUser = function(app, note) {

   var Installation = app.models.installation;
   var Notification = app.models.notification;


   var cb = function(err, res) {
      if(err) console.log('Failed to create notification! ' + err);
      else {
         //console.log('Successfully created a notification! ' + res);
      }
   };

   Installation.find({where: { userId: note.username }}, function(err, res) {
      if (err)
         console.log('Error finding installation!: ' + err);
      else {
         if( res.length > 0) {
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
                  console.log('Unkown device! Not creating a notification');
                  break;
               }
               console.log('Creating notification: ' + note.toString());
               Notification.create(note, cb);
            }
         }
         else {
          //  console.log('No devices found for ' + username);
         }
      }
   });
};

module.exports.notifyUser = notifyUser;
