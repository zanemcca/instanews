
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/apps
   endpoint: 'apps',
   models: [
   {
      type: 'apps',
      name: 'app'
   }],
   results: [
   {
      request: 'get',
      admin: 200,
      guest: 200,
      user: 200
   },
   {
      request: 'put',
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
      // #/apps/{id}
      results: [
      {
         request: 'put',
         admin: 200,
         guest: 200,
         user: 200
      },
      {
         request: 'head',
         admin: 200,
         guest: 200,
         user: 200
      },
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
         // #/apps/{id}/exists
         endpoint: 'exists',
         results: [
         {
            request: 'get',
            all: 200
         }]
      }]
   },
   {
      // #/apps/count
      endpoint: 'count',
      results: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/apps/findOne
      endpoint: 'findOne',
      results: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/apps/update
      endpoint: 'update',
      results: [
      {
         request: 'post',
         all: 500
      }]
   }]
};

