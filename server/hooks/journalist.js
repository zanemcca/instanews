
var LIMIT = 10;

module.exports = function(app) {

   var Journalist = app.models.journalist;

   Journalist.afterRemote('prototype.__get__articles',
   function(ctx, instance, next) {

      //Automatically remove all duplicate articles
      //Duplicates can be present since the articles associated
      //with a journalist come through their subarticles
      var uniqueIds = [];
      for(var i = 0; i < instance.length; i++) {
         if(uniqueIds.indexOf(instance[i].id) > -1 ) {
            instance.splice(i,1);
            i--;
         }
         else {
            uniqueIds.push(instance[i].id);
         }
      }

      next();
   });

    Journalist.afterRemoteError('login',
    function(ctx, next) {
      app.brute.prevent(ctx.req, ctx.res, function() {
             next();
      });
    });

    Journalist.beforeRemote('create', function(ctx, instance, next) {
      var user;
      if( instance ) {
        user = instance;
      }
      else if( ctx && ctx.req && ctx.req.body) {
        user = ctx.req.body;
      }
      else {
        next(new Error('Bad user given for creation!'));
      }

      console.log('User: ' + JSON.stringify(user));

      if( !user.password || user.password.length < 8) {
        console.log('Password is too weak!');
        next(new Error('Password is too weak!'));
      }
      else {
        Journalist.count({
            or: [{
              email: user.email
            },
            {
              username: user.username
            }]
        }, function(err, count) {
          if( err) {
            next(err);
          }
          else if(count === 0) {
            next();
          }
          else {
            console.log('Username or email is already used!');
            next(new Error('Username or email is already used!')); 
          }
        });
      }
    });

   Journalist.observe('access', function(ctx, next) {
      //Reserved contents for the owner only
      ctx.query.fields = {
         email: false
      };

     //Limit the queries to LIMIT per request
     if( !ctx.query.limit || ctx.query.limit > LIMIT) {
            ctx.query.limit = LIMIT;
     }
      next();
   });
};
