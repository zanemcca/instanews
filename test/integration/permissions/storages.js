
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/storages
   endpoint: 'storages',
   myResults: [
   {
      request: 'get',
		all: 404
   },
   {
      request: 'post',
		all: 404
   }],
   children: [
   {
      // #/storages/{container}
      myResults: [
      {
         request: 'get',
		   all: 404
      },
      {
         request: 'delete',
		   all: 404
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
            all: 404 
         }],
         children: [
         {
            // #/storages/{container}/files/{file}
            myResults: [
            {
               request: 'get',
               all: 404 
            },
            {
               request: 'delete',
					all: 404
            }],
         }]
      },
      {
         // #/storages/{container}/upload
         endpoint: 'upload',
         myResults: [
         {
            request: 'post',
			   admin: 200,
			   user: 200,
			   guest: 401
         }]
      }]
   }]
};

