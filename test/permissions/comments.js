
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/comments
   endpoint: 'comments',
   theirResults: [
   {
      request: 'get',
      admin: 200,
      guest: 200,
      user: 200
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
      // #/comments/{id}
      theirResults: [
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
         endpoint: 'commentable',
         theirResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         endpoint: 'comments',
         theirResults: [
         {
            request: 'post',
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
            theirResults: [
            {
               request: 'put',
               all: 404
            },
            {
               request: 'get',
               all: 404
            },
            {
               request: 'delete',
               all: 404
            }]
         },
         {
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/comments/{id}/downVotes
         endpoint: 'downVotes',
         theirResults: [
         {
            request: 'post',
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
            // #/comments/{id}/downVotes/{fk}
            theirResults: [
            {
               request: 'put',
               all: 404
            },
            {
               request: 'get',
               all: 404
            },
            {
               request: 'delete',
               all: 404
            }]
         },
         {
            // #/comments/{id}/downVotes/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/comments/{id}/exists
         endpoint: 'exists',
         theirResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/comments/{id}/journalists
         endpoint: 'journalists',
         theirResults: [
         {
            request: 'get',
            all: 404
         }],
      },
      {
         // #/comments/{id}/upVotes
         endpoint: 'upVotes',
         theirResults: [
         {
            request: 'post',
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
            // #/comments/{id}/upVotes/{fk}
            theirResults: [
            {
               request: 'put',
               all: 404
            },
            {
               request: 'get',
               all: 404
            },
            {
               request: 'delete',
               all: 404
            }]
         },
         {
            // #/comments/{id}/upVotes/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      }]
   },
   {
      // #/comments/count
      endpoint: 'count',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/comments/findOne
      endpoint: 'findOne',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/comments/update
      endpoint: 'update',
      theirResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};
