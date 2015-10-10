
/* jshint camelcase: false */

module.exports = function(app) {

  var File = app.models.file;
  var Storage = app.models.Storage;
  var debug = app.debug('hooks:file');

  File.beforeSave = function (inst, next) {
    debug('before save', inst, next);
    console.log(inst);
    if ( inst.type.indexOf('video') === 0) {
      //TODO Check if video is available on S3
      Storage.triggerTranscoding( inst.container, inst.name, function (err, res) {
        //TODO Add new formats as the sources for the file and return
        console.log(res);
        next();
      });
    }
    else {
      //console.log('Saving some other media type');
      next();
    }
  };
};
