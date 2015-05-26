
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/upVotes
   endpoint: 'upVotes',
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
      // #/upVotes/{id}
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
         // #/upVotes/{id}/exists
         endpoint: 'exists',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/upVotes/{id}/journalist
         endpoint: 'journalist',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/upVotes/{id}/votable
         endpoint: 'votable',
         myResults: [
         {
            request: 'get',
            all: 404
         }]
      }]
   },
   {
      // #/upVotes/count
      endpoint: 'count',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/upVotes/findOne
      endpoint: 'findOne',
      myResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/upVotes/update
      endpoint: 'update',
      myResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};

