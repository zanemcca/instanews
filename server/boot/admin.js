
module.exports = function(app) {
  var Admin = app.models.Admin;
  var Role = app.models.Role;
  var loopback = require('loopback');

  Role.registerResolver('admin', function(role, ctx, cb) {
    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }

    var userId;
    var context = loopback.getCurrentContext();
    if(context) {
      var token = context.get('accessToken');
      if(token) {
        userId = token.userId;
        if(!userId) {
          return reject();
        }
      }
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
      cb(null, true); // true = is a team member
    });
  });
};
