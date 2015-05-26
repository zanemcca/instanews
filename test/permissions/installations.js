
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/installations
   endpoint: 'installations',
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
      admin: 200,
      guest: 401,
      user: 200
   }],
   children: [
   {
      // #/installations/{id}
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
         // #/installations/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/installations/{id}/journalist
         endpoint: 'journalist',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      }]
   },
   {
      // #/installations/byApp
      endpoint: 'byApp',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/installations/bySubscriptions
      endpoint: 'bySubscriptions',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/installations/byUser
      endpoint: 'byUser',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/installations/count
      endpoint: 'count',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/installations/findOne
      endpoint: 'findOne',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/installations/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};

