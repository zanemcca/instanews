
module.exports = function (app) {
   // Setup push notifications
   var App = app.models.app;
   var Push = app.models.push;
   var Votes = app.models.votes;

   var appName = 'instanews';
   //TODO Keep this key private
   var gcmServerApiKey = 'AIzaSyBPBlcVkSFmWc2_BxXs0OsWxJ7V5mSIEjQ';

   function startPushServer() {

      Push.on('error', function (err) {
         console.log('Push Notification error: ', err.stack);
      });


      App.observe('before save', function(ctx, next) {
         var inst = ctx.instance;
         if( inst) {
            if( inst.name === appName) {
               inst.id = 'instanews';
            }
         }
         next();
      });

      App.register('zanemcca', appName,{
         description: 'Local Citizen Journalism',
         pushSettings: {
            //TODO Apple credentials
            gcm: {
               serverApiKey: gcmServerApiKey
            }
         }
      },function(err, app) {
         if (err) {
            console.log('Error Registering app: ' , err);
         }
         else {
//            console.log('Registration of app successful: ' , app);
         }
      });
   }

   startPushServer();

};
