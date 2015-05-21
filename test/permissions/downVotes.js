
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/downVotes
   endpoint: 'downVotes',
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
      // #/downVotes/{id}
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
         // #/downVotes/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      },
      {
         // #/downVotes/{id}/journalist
         endpoint: 'journalist',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      },
      {
         // #/downVotes/{id}/votable
         endpoint: 'votable',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      }]
   },
   {
      // #/downVotes/count
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
      // #/downVotes/findOne
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
      // #/downVotes/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 500
      }]
   }]
};

