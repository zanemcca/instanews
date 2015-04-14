
var app = angular.module('instanews.localStorage', ['ionic','ngResource', 'ngCordova']);

app.service('LocalStorage', [
      '$cordovaFile',
      function($cordovaFile){

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

      $cordovaFile.writeFile(cordova.file.dataDirectory, file, encrypted, true)
      .then( function (success) {
         console.log('Successful write!');
      }, function (err) {

         console.log('Error writing file: '+ err.message);
      });
   };

   var secureRead = function(key, cb) {

      var file = getFileName(CryptoJS.SHA256(key));
 //     console.log('Trying to read ' + file);

      $cordovaFile.readAsText(cordova.file.dataDirectory, file)
      .then( function (encrypted) {

         console.log('Successfully read file');
         var value = encrypted;
         var decrypted = CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
         cb(null, JSON.parse(decrypted));
      }, function (err) {

         console.log('Error reading file: '+ err.message);
         cb(err.message, null);
      });
   };

   //TODO Ensure the data gets overwritten at the deletion address
   var secureDelete = function(key) {
      var file = getFileName(CryptoJS.SHA256(key));
      //console.log('Trying to delete ' + file);

      $cordovaFile.removeFile(cordova.file.dataDirectory, file)
      .then( function (success) {

         console.log('Successfully deleted file');
      }, function (err) {

         console.log('Error deleting file: '+ err.message);
      });
   };

   return {
      secureWrite: secureWrite,
      secureDelete: secureDelete,
      secureRead: secureRead
   };
}]);
