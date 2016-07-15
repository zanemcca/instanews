
module.exports = function(app) {
  var Admin = app.models.Admin;
  var Role = app.models.Role;
  var loopback = require('loopback');

  Role.registerResolver('admin', function(role, ctx, cb) {
    function done(err, isInRole) {
      process.nextTick(function() {
        cb(err, isInRole);
      });
    }

    var users = ctx.principals.map(function(principal) {
      return principal.id;
    });

    // Check if the user is an admin 
    Admin.find({ 
      where: {
        username: {
         inq: users
        } 
      }
    }, function(err, usrs) {
      if (err) {
        console.log(err);
        done(null, false);
      } else if(usrs.length !== users.length) {
        done(null, false);
      } else {
        done (null, true); // true = is a team member
      }
    });
  });
};
