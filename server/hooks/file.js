module.exports = function(app) {

  var File = app.models.file;
  var Storage = app.models.Storage;
  var debug = app.debug('hooks:file');

  File.beforeSave = function (inst, next) {
    var dd = app.DD('File', 'beforeSave');
    debug('before save', inst, next);
    //TODO Check if video is available on S3
    Storage.triggerTranscoding( inst.container, inst.name, function (err, res) {
      dd.lap('Storage.triggerTranscoding');
      if(err) {
        return next(err);
      }

      console.log('Finished transcoding trigger!');
      if(res) {
        inst.sources = res.outputs;
        inst.poster = res.posters[0];
        inst.jobId = res.id;
        inst.unsetAttribute('name');
      } else {
        inst.jobId = inst.name;
      }

      inst.unsetAttribute('source');
      inst.unsetAttribute('container');

      console.dir(inst);

      next();
    });
  };
};
