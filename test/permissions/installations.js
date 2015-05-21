
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/installations
   endpoint: 'installations',
   myResults: [
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
      // #/installations/{id}
      myResults: [
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
         // #/installations/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      },
      {
         // #/installations/{id}/journalist
         endpoint: 'journalist',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      }]
   },
   {
      // #/installations/byApp
      endpoint: 'byApp',
      myResults: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/installations/bySubscriptions
      endpoint: 'bySubscriptions',
      myResults: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/installations/byUser
      endpoint: 'byUser',
      myResults: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/installations/count
      endpoint: 'count',
      myResults: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/installations/findOne
      endpoint: 'findOne',
      myResults: [
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      }]
   },
   {
      // #/installations/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 500
      }]
   }]
};

