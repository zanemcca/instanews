
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/storages
   endpoint: 'storages',
   myResults: [
   {
      request: 'get',
      admin: 200,
      guest: 200,
      user: 200
   },
   {
      request: 'post',
      admin: 200,
      guest: 200,
      user: 200
   }],
   children: [
   {
      // #/storages/{container}
      myResults: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      },
      {
         request: 'delete',
         admin: 204,
         guest: 204,
         user: 204
      }],
      children: [
      {
         // #/storages/{container}/download
         endpoint: 'download',
         children: [
         {
            // #/storages/{container}/download/{file}
            myResults: [
            {
               request: 'get',
               all: 200
            }]
         }]
      },
      {
         // #/storages/{container}/files
         endpoint: 'files',
         myResults: [
         {
            request: 'get',
            all: 200
         }],
         children: [
         {
            // #/storages/{container}/files/{file}
            myResults: [
            {
               request: 'get',
               all: 200
            },
            {
               request: 'delete',
               all: 204
            }]
         }]
      },
      {
         // #/storages/{container}/upload
         endpoint: 'upload',
         myResults: [
         {
            request: 'post',
            all: 200
         }]
      }]
   }]
};

