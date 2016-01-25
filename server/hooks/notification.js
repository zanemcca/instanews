
var LIMIT = 20;

module.exports = function(app) {

  var Notification = app.models.notif;
  var Installation = app.models.installation;
  var Push = app.models.push;
  var debug = app.debug('hooks:notification');

  Notification.observe('after save', function(ctx, next) {
    debug('after save', ctx, next);
    var note = ctx.instance;
    if (note && ctx.isNewInstance) {

      //Find all installations for the given user
      Installation.find({
        where: {
          userId: note.username
        }
      }, function(err, res) {
        if (err)
          console.error('Error finding installation!: ' + err);
        else {
          if( res.length > 0) {

            var report = function(err) {
              if (err) {
                console.error('Error pushing notification: ' + err);
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
                console.warn('Unkown device! Not pusing a notification');
                break;
              }
              //console.log('Creating notification: ' + note.toString());

              debug('after save: Creating a notification!', note);

              //Push the notification
              Push.notifyById(res[i].id , note, report);
            }
          }
          else {
            console.log('No devices found for ' + note.username);
          }
        }
      });
    }
    next();
  });

  Notification.observe('access' , function(ctx, next) {
    debug('access', ctx, next);
    //Limit the queries to LIMIT per request
    if( !ctx.query.limit || ctx.query.limit > LIMIT) {
      ctx.query.limit = LIMIT;
    }
    next();
  });

  Notification.observe('before save', function(ctx, next) {
    debug('before save', ctx, next);
    var note = ctx.instance || ctx.data;

    if (note) {
      if(ctx.isNewInstance) {
        note.created = new Date();
      }
      note.modified = new Date();
    }
    next();
  });
};
