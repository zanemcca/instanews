
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

  var writeFile = function(dir ,filename, data) {
    if(Platform.isBrowser()) {
      if(typeof(data) === 'string') {
        window.localStorage[dir + '-' + filename] = data;
      } else {
        window.localStorage[dir + '-' + filename] = JSON.stringify(data);
      }
    } else {
      var write = function() {
        var path = Platform.getDataDir();
        if(dir.length > 0) {
          path += dir + '/';
        }
        $cordovaFile.writeFile(path, filename, data, true)
        .then( function() {
          //console.log('Successful write of ' + filename);
        }, function(err) {
          console.log('Error: Failed to write ' + Platform.getDataDir() + dir + '/' + filename + ': ' + JSON.stringify(err));
        });
      };

      $cordovaFile.checkDir(Platform.getDataDir(), dir)
      .then( write(), function(err) {
        if(err.code === 1) {
          $cordovaFile.createDir(Platform.getDataDir(),dir,true)
          .then( write(), function(err) {
            console.log('Error: Failed to create directory ' + Platform.getDataDir() + dir + ': ' + JSON.stringify(err));
          });
        }
        else {
          console.log('Error: There was an error checking the directory ' + Platform.getDataDir() + dir + ': ' + JSON.stringify(err));
        }
      });
    }
  };

  var readFiles = function(dir, cb) {
    if(Platform.isBrowser()) {
      console.log('Cannot read files in the browser');
    } else {
      var path = Platform.getDataDir();
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
    }
  };

  var readFile = function(dir, filename, cb) {
    if(Platform.isBrowser()) {
      var res =  window.localStorage[dir + '-' + filename];
      if(res) {
        console.log('Read this:');
        console.log(res);
        try {
          var obj = JSON.parse(res);
          cb(null, obj);
        } catch(e) {
          cb(null, res);
        }
      } else {
        cb();
      }
    } else {
      var path = Platform.getDataDir();
      if(dir.length > 0) {
        path += dir + '/';
      }
      $cordovaFile.readAsText(path, filename)
      .then( function(text) {
        var types = filename.split('.');
        var type = types[types.length - 1];

        var res;
        if( type === 'json' ) {
          try { 
            res = JSON.parse(text);
          } catch(e) {
            return cb(e);
          }
        } else {
          res = text;
        }

        cb(null,res);

      }, function(err) {
        console.log('Error: Failed to read file ' + filename + ': ' + JSON.stringify(err));
        cb(err.message);
      });
    }
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
       try {
         //console.log('Successfully read ' + JSON.stringify(decrypted, 'utf8', '  ') +
         //' from ' + key + ' (' + file + ')');
         var decrypted = JSON.parse(CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8));

         if(decrypted) {
           cb(null, decrypted);
         } else {
           cb();
         }
       } catch(e) {
         cb(e);
       }
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

      $cordovaFile.removeFile(Platform.getDataDir(), file)
      .then( function (success) {
         console.log('Successfully deleted file!'+ JSON.stringify(success.fileRemoved.name));
      }, function (err) {
         console.log('Error deleting file: '+ err.message);
      });
   };

   var deleteFile = function(dir, file) {
    if(Platform.isBrowser()) {
      delete window.localStorage[dir + '-' + filename];
      console.log('Cannot delete files in the browser');
    } else {
      $cordovaFile.removeFile(Platform.getDataDir() + dir, file)
      .then( function (success) {
         console.log('Successfully deleted file!'+ JSON.stringify(success.fileRemoved.name));
      }, function (err) {
         console.log('Error deleting file: '+ JSON.stringify(err));
      });
    }
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
