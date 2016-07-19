
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

  var writeFile = function(isLocal, dir ,filename, data) {
    if(Platform.isBrowser() || isLocal) {
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

      Platform.permissions.storage.requestAuthorization( function (succ) {
        if(succ) {
          $cordovaFile.checkDir(Platform.getDataDir(), dir)
          .then( write, function(err) {
            if(err.code === 1) {
              $cordovaFile.createDir(Platform.getDataDir(),dir,true)
              .then( write, function(err) {
                console.log('Error: Failed to create directory ' + Platform.getDataDir() + dir + ': ' + JSON.stringify(err));
              });
            }
            else {
              console.log('Error: There was an error checking the directory ' + Platform.getDataDir() + dir + ': ' + JSON.stringify(err));
            }
          });
        } else {
          console.log('Storage Write Permission denied!');
        }
      }, function(err) {
        console.log(err);
      });
    }
  };

  var readFiles = function(isLocal, dir, cb) {
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
            readFile(isLocal, dir, String(name[name.length -1]), handle);
          }
        }, function(err) {
          console.log('Error: Failed to read the directory! ' + JSON.stringify(err));
          cb(err);
        });
      });
    }
  };

  var readFile = function(isLocal, dir, filename, cb) {
    if(Platform.isBrowser() || isLocal) {
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

      Platform.permissions.storage.requestAuthorization( function (succ) {
        if(succ) {
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
        } else {
          var err = new Error('Permission denied');
          err.status = 401;
          console.log(err);
          cb(err);
        }
      }, function(err) {
        console.log(err);
        cb(err);
      });
    }
  };

   var deleteFile = function(isLocal, dir, file) {
    if(isLocal || Platform.isBrowser()) {
      delete window.localStorage[dir + '-' + file];
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

   var getFileName = function(partial) {
      return '.' + partial + '.txt';
   };

   //TODO Use native encryption on Android and keychain on iOS
   var secureWrite = function(isLocal, key, value) {
     var val = JSON.stringify(value);
     var encrypted = CryptoJS.AES.encrypt(val, key).toString();

     var file = getFileName(CryptoJS.SHA256(key));
//     console.log('Trying to write \"'+ val + '\" to ' + file);
//     console.log('Encrypted to: ' + encrypted);

     writeFile(isLocal, '', file, encrypted);
   };

   var secureRead = function(isLocal, key, cb) {
     var file = getFileName(CryptoJS.SHA256(key));
//     console.log('Trying to read ' + file);

    readFile(isLocal, '', file, function(err, encrypted) {
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
   var secureDelete = function(isLocal, key) {
      var file = getFileName(CryptoJS.SHA256(key));
      //console.log('Trying to delete ' + file);
      deleteFile(isLocal, '', file);
   };

  return {
    writeFile: writeFile.bind(this, false),
    readFile: readFile.bind(this, false),
    readFiles: readFiles.bind(this, false),
    deleteFile: deleteFile.bind(this, false),
    secureWrite: secureWrite.bind(this, false),
    secureDelete: secureDelete.bind(this, false),
    secureRead: secureRead.bind(this, false),
    writeFileLocal: writeFile.bind(this, true),
    readFileLocal: readFile.bind(this, true),
    readFilesLocal: readFiles.bind(this, true),
    deleteFileLocal: deleteFile.bind(this, true),
    secureWriteLocal: secureWrite.bind(this, true),
    secureDeleteLocal: secureDelete.bind(this, true),
    secureReadLocal: secureRead.bind(this, true)
  };
}]);
