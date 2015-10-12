
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
        console.log('Finished transcoding trigger!');
        console.dir(res);
        inst.sources = res.outputs;
        inst.container = res.container;
        inst.jobId = res.id;

        next();
      });
    }
    else {
      //console.log('Saving some other media type');
      next();
    }
  };
};
