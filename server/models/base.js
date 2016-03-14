var common = require('./common');

module.exports = function(Base) {
  common.initBase(Base);

  var modifyDeferredUpdate = function (job, data, next) {
    //TODO Update the job with the new data
    next();
  };

  Base.deferUpdate = function (id, type, data, next) {
    console.log('Creating an update job for ' + type + ': ' + id);
    //TODO Search and update before trying to create
    Base.app.jobs.create('updateBase', {
      id: id,
      type: type,
      data: data
    }).searchKeys(['id', 'type']).save();

    next();
  };
};
