
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/downVotes
   endpoint: 'downVotes',
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
      // #/downVotes/{id}
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
         // #/downVotes/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/downVotes/{id}/journalist
         endpoint: 'journalist',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/downVotes/{id}/votable
         endpoint: 'votable',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      }]
   },
   {
      // #/downVotes/count
      endpoint: 'count',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/downVotes/findOne
      endpoint: 'findOne',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/downVotes/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};

