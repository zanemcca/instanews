
//var should = require('chai').should(),
var supertest = require('supertest'),
    app = require('../server/server'),
    api = supertest(app),
    assert = require('assert');

function importTest(name, path) {
   describe(name, function () {
      require(path);
   });
}

var dump = function(err, res) {
   /*
   if (err) {
      console.log(err);
   }
   else if(res && res.body && res.body.error) {
      console.log('\nName: ' + res.body.error.name + '\tStatus: ' + res.body.error.status);
      console.log('Message: ' + res.body.error.message);
      console.log('\n' + res.body.error.stack + '\n');
   }
   /*
   else {
      console.log(res.body);
   }
   */
};

var removeModel = function(model, models) {
   if( models ) {
      for(var i = 0; i < models.length; i++) {
         if(models[i].type === model.type) {
            models.splice(i,1);
            return models;
         }
      }
   }
   //console.log('No model found for ' + type);
   return models;
};

var findModel = function(type, models) {
   if( models ) {
      for(var i = 0; i < models.length; i++) {
         if(models[i].type === type) {
            return models[i];
         }
      }
   }
   //console.log('No model found for ' + type);
   return;
};

exports.assert = assert;
exports.app = app;
exports.api = api;
exports.importTest = importTest;
exports.dump = dump;
exports.findModel = findModel;
exports.removeModel = removeModel;
