
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/apps
   endpoint: 'apps',
   myResults: [
   {
      request: 'get',
      all: 404
   },
   {
      request: 'put',
      all: 404
   },
   {
      request: 'post',
      all: 404
   }],
   children: [
   {
      // #/apps/{id}
      myResults: [
      {
         request: 'put',
         all: 404
      },
      {
         request: 'head',
         all: 404
      },
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
         // #/apps/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      }]
   },
   {
      // #/apps/count
      endpoint: 'count',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/apps/findOne
      endpoint: 'findOne',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/apps/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};

