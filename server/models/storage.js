
var common = require('./common');

module.exports = function(Storage) {

   var staticDisable = [
		'getContainers',
		'getContainer',
		'createContainer',
		'destroyContainer',
		'getFiles',
		'removeFile',
		'getFile'
   ];

   common.disableRemotes(Storage,staticDisable,true);
};
