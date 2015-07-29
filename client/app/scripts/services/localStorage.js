
'use strict';
var app = angular.module('instanews.service.localStorage', ['ionic','ngResource', 'ngCordova']);

app.service('LocalStorage', [
  'ENV',
  'Platform',
  '$cordovaFile',
  function(
    ENV,
    Platform,
    $cordovaFile
  ){

  var dataDir;
  Platform.ready
  .then( function() {
    dataDir = cordova.file.dataDirectory;
  });

  var writeFile = function(dir ,filename, data) {

    var write = function() {
      var path = dataDir;
      if(dir.length > 0) {
        path += dir + '/';
      }
      $cordovaFile.writeFile(path, filename, data, true)
      .then( function() {
        console.log('Successful write of ' + filename);
      }, function(err) {
        console.log('Error: Failed to write ' + dataDir + dir + '/' + filename + ': ' + JSON.stringify(err));
      });
    };

    $cordovaFile.checkDir(dataDir, dir)
    .then( write(), function(err) {
      if(err.code === 1) {
        $cordovaFile.createDir(dataDir,dir,true)
        .then( write(), function(err) {
          console.log('Error: Failed to create directory ' + dataDir + dir + ': ' + JSON.stringify(err));
        });
      }
      else {
        console.log('Error: There was an error checking the directory ' + dataDir + dir + ': ' + JSON.stringify(err));
      }
    });
  };

  var readFiles = function(dir, cb) {
    var path = dataDir;
    if(dir.length > 0) {
      path += dir + '/';
    }

    var done = 0;
    var total = 0;
    var files = [];
    var handle = function(err,res) {
      done++;
      if(res) {
        files.push(res);
      }
      if(done === total) {
        console.log('Success: Read the directory!'); 
        cb(null, files);
      }
    };

    window.resolveLocalFileSystemURL(path, function(fileSystem) {
      var dirReader = fileSystem.createReader();
      dirReader.readEntries( function(res) {
        total = res.length;
        for( var i = 0; i < res.length; i++) {
          var name = res[i].fullPath.split('/');
          readFile(dir, String(name[name.length -1]), handle);
        }
      }, function(err) {
        console.log('Error: Failed to read the directory! ' + JSON.stringify(err));
        cb(err);
      });
    });
  };

  var readFile = function(dir, filename, cb) {
    var path = dataDir;
    if(dir.length > 0) {
      path += dir + '/';
    }
    $cordovaFile.readAsText(path, filename)
    .then( function(text) {
      var types = filename.split('.');
      var type = types[types.length - 1];

      var res;
      if( type === 'json' ) {
        res = JSON.parse(text);
      } else {
        res = text;
      }

      cb(null,res);

    }, function(err) {
      console.log('Error: Failed to read file ' + filename + ': ' + JSON.stringify(err));
      cb(err.message);
    });
  };

   var getFileName = function(partial) {
      return '.' + partial + '.txt';
   };

   //TODO Use native encryption on Android and keychain on iOS
   var secureWrite = function(key, value) {

      var val = JSON.stringify(value);
      var encrypted = CryptoJS.AES.encrypt(val, key).toString();

      var file = getFileName(CryptoJS.SHA256(key));
 //     console.log('Trying to write \"'+ val + '\" to ' + file);
 //     console.log('Encrypted to: ' + encrypted);

      writeFile('', file, encrypted);
   };

   var secureRead = function(key, cb) {

      var file = getFileName(CryptoJS.SHA256(key));
 //     console.log('Trying to read ' + file);

      readFile('', file, function(err, encrypted) {
        if(!err) {
         console.log('Successfully read file');
         var value = encrypted;
         var decrypted = CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
         cb(null, JSON.parse(decrypted));
        } else {
         console.log('Error reading file: '+ err.message);
         cb(err.message, null);
        }
      });
   };

   //TODO Ensure the data gets overwritten at the deletion address
   var secureDelete = function(key) {
      var file = getFileName(CryptoJS.SHA256(key));
      //console.log('Trying to delete ' + file);

      $cordovaFile.removeFile(dataDir, file)
      .then( function (success) {
         console.log('Successfully deleted file!'+ JSON.stringify(success.fileRemoved.name));
      }, function (err) {
         console.log('Error deleting file: '+ err.message);
      });
   };

   var deleteFile = function(dir, file) {
      $cordovaFile.removeFile(dataDir + dir, file)
      .then( function (success) {
         console.log('Successfully deleted file!'+ JSON.stringify(success.fileRemoved.name));
      }, function (err) {
         console.log('Error deleting file: '+ JSON.stringify(err));
      });
   };

  return {
    writeFile: writeFile,
    readFile: readFile,
    readFiles: readFiles,
    deleteFile: deleteFile,
    secureWrite: secureWrite,
    secureDelete: secureDelete,
    secureRead: secureRead
  };
}]);
