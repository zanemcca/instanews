
var app;
if( process.env.NODE_ENV === 'staging' ) {
  app = require('../server/server');
}
else {
  app = require('../server/server');
}

//var should = require('chai').should(),
var supertest = require('supertest'),
    api = supertest(app),
    assert = require('assert');

var expect = require('chai').expect;

function importTest(name, path) {
   describe(name, function () {
      require(path);
   });
}

function getBaseDir() {
  return __dirname + '/../server/';
}

function req(file) {
  return require(getBaseDir() + file);
}


var dump = function(err, res) {
  /*
   if (err) {
      console.log(err);
   }
   if(res && res.body && res.body.error) {
      console.log('\nName: ' + res.body.error.name + '\tStatus: ' + res.body.error.status);
      console.log('Message: ' + res.body.error.message);
      console.log('\n' + res.body.error.stack + '\n');
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

/*
 * This function will run the given function at the given
 * interval until the function either calls the stop
 * callback function or the given timeout occurs.
 * The given callback function will be called once the
 * loop stops
 */
var runTillDone = function(func, cb, interval, timeout) {
   if(!interval) {
      //Default interval is 10 milliseconds
      interval = 10;
   }
   if(!timeout) {
      //Default timeout is 1 seconds
      timeout = 1000;
   }

   var intervalFunc = setInterval(function() {
      func(stop);
   }, interval);

   var timeoutFunc = setTimeout( function() {
      /*jshint expr: true*/
      clearInterval(intervalFunc);
      console.log('The function has timed out!');
      expect(false).to.be.true;
      cb();
   }, timeout);

   var done = false;
   var stop = function() {
      if(!done) {
         done = true;
         clearTimeout(timeoutFunc);
         clearInterval(intervalFunc);
         cb();
      }
   };
};

var disableDatabase = function () {
  var memory = app.dataSources.db;
  if(!memory) {
    console.log('Failed to find memory DB');
    return new Error('Failed to find memory DB');
  }
  else {
    for(var index in app.models) {
      Model = app.models[index];
      //TODO save current datasources for later reEnablement
      Model.attachTo(memory);
    }
    return;
  }
};

var enableDatabase = function () {
  //TODO reenable the database
};

exports.database = {
  disable: disableDatabase,
  enable: enableDatabase
};

exports.serverDir = getBaseDir(); 
exports.assert = assert;
exports.app = app;
exports.api = api;
exports.importTest = importTest;
exports.dump = dump;
exports.findModel = findModel;
exports.removeModel = removeModel;
exports.runTillDone = runTillDone;
exports.req = req;
