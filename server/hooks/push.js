

var notifyUser = function(app, username, message) {

   var Installation = app.models.installation;
   var Notification = app.models.notification;


   var cb = function(err, res) {
      if(err) console.log('Failed to create notification! ' + err);
      else {
         //console.log('Successfully created a notification! ' + res);
      }
   };

   Installation.find({where: { userId: username }}, function(err, res) {
      if (err)
         console.log('Error finding installation!: ' + err);
      else {
         if( res.length > 0) {
            for(var i = 0; i < res.length; i++) {

               var note = {};
               if(res[i].deviceType === 'android') {
                  note = {
                     username: username,
                     installationId: res[i].id,
                     deviceType: res[i].deviceType,
                     deviceToken: res[i].deviceToken,
                     expirationInterval: 3600, //Expire in 1 hr
                     message: message,
                     messageFrom: 'zane'
                  };
               }
               else if (res[i].deviceType === 'ios') {
                  note = {
                     username: username,
                     installationId: res[i].id,
                     deviceType: res[i].deviceType,
                     deviceToken: res[i].deviceToken,
                     expirationInterval: 3600, //Expire in 1 hr
                     badge: 1,
                     sound: 'ping.aiff',
                     alert: message,
                     messageFrom: 'zane'
                  };
               }
               else {
                  console.log('Unkown device! Note creatinf a notification');
                  break;
               }
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
