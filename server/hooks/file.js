
/* jshint camelcase: false */

module.exports = function(app) {

  var File = app.models.file;
  var Storage = app.models.Storage;
  var debug = app.debug('hooks:file');

  File.beforeSave = function (inst, next) {
    debug('before save', inst, next);
    console.log(inst);
      //TODO Check if video is available on S3
      Storage.triggerTranscoding( inst.container, inst.name, function (err, res) {
        if(err) {
          return next(err);
        }

        console.log('Finished transcoding trigger!');
        console.dir(res);
        inst.sources = res.outputs;
        inst.container = res.container;
        inst.jobId = res.id;

        next();
      });
  };
};
