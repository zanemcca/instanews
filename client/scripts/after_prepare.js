

module.exports = function(ctx) {

  console.log('------------------------------------------------------------------------------------------');
  console.log('Running hook: after_prepare');
  console.log('------------------------------------------------------------------------------------------');

  //var ncp = ctx.requireCordovaModule('ncp').ncp;
  var ncp = require('ncp').ncp;
  var path = ctx.requireCordovaModule('path');
  var deferral = ctx.requireCordovaModule('q').defer();

  var inputFolder = path.join(ctx.opts.projectRoot, '/resources/notification/');
  var outputFolder = path.join(ctx.opts.projectRoot, '/platforms/android/res/');

  ncp(inputFolder, outputFolder, function (err) {
    if(err) {
      console.error(err.stack);
      deferral.reject(err);
    } else {
      console.log('Successfully copied notification icons');
      deferral.resolve();
    }
  });
  
  return deferral.promise;
};
