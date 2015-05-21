
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/upVotes
   endpoint: 'upVotes',
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
      // #/upVotes/{id}
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
         // #/upVotes/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      },
      {
         // #/upVotes/{id}/journalist
         endpoint: 'journalist',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      },
      {
         // #/upVotes/{id}/votable
         endpoint: 'votable',
         myResults: [
         {
            request: 'get',
            all: 200
         }]
      }]
   },
   {
      // #/upVotes/count
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
      // #/upVotes/findOne
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
      // #/upVotes/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 500
      }]
   }]
};

