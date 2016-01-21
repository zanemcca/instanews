module.exports = function(app) {
  var AdminDB = app.dataSources.Admins;
  var Admin;

  Admin = AdminDB.buildModelFromInstance('admin', { username: 'user' }, { idInjection: true});

  var Role = app.models.Role;

  Role.registerResolver('admin', function(role, context, cb) {
    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }

    // do not allow anonymous users
    var userId = context.accessToken.userId;
    if (!userId) {
      return reject();
    }

    // Check if the user is an admin 
    Admin.findOne({ 
      where: {
        username: userId
      }
    }, function(err, user) {
      if (err) {
        console.log(err);
        return cb(null, false);
      }

      if(!user) {
        return cb(null, false);
      }

      console.log('Admin Verified: ' + user.username);
      console.log(user);
      cb(null, true); // true = is a team member
    });

  });
};
