
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

var generateRandomString = function (length) {
  if(!length) length = 8;
  var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  var name = '';
  for(var i = 0; i < length; i++) {
    name += chars[Math.floor(Math.random()*chars.length)];
  }
  return name;
};

var generateRandomLocation = function (bottomLeft, upperRight) {
  var maxLat, minLat, maxLng, minLng;
  if(bottomLeft && upperRight) {
    maxLat = upperRight.lat;
    maxLng = upperRight.lng;
    minLat = bottomLeft.lat;
    minLng = bottomLeft.lng;
  }

  if(!minLng) {
    minLng = -180;
  }
  if(!minLat) {
    minLat = -90;
  }
  if(!maxLat) {
    maxLat = 90;
  }
  if(!maxLng) {
    maxLng = 180;
  }

  return {
    lat: Math.random()*(maxLat -minLat) + minLat,
    lng: Math.random()*(maxLng -minLng) + minLng
  };
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
      interval = 40;
   }
   if(!timeout) {
      //Default timeout is 1 seconds
      timeout = 5000;
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

exports.resetServer = function () {
  process.exit(0);
  exports.app = require('../server/server');
  exports.api = supertest(app);
};

exports.importTest = importTest;
exports.dump = dump;
exports.findModel = findModel;
exports.removeModel = removeModel;
exports.runTillDone = runTillDone;
exports.req = req;
exports.generate = {
  randomString: generateRandomString,
  randomLocation: generateRandomLocation
};
