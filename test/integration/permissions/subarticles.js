
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/subarticles
   endpoint: 'subarticles',
   theirResults: [
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
      // #/subarticles/{id}
      theirResults: [
      {
         request: 'put',
         all: 404
      },
      {
         request: 'head',
         all: 200
      },
      {
         request: 'get',
         admin: 200,
         guest: 200,
         user: 200
      },
      {
         request: 'delete',
         all: 404
      }],
      children: [
      {
         endpoint: 'article',
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
         // #/subarticles/{id}/downVotes
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
            // #/subarticles/{id}/downVotes/{fk}
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
            // #/subarticles/{id}/downVotes/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/subarticles/{id}/exists
         endpoint: 'exists',
         theirResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/subarticles/{id}/file
         endpoint: 'file',
         theirResults: [
         {
            request: 'get',
            all: 404
         },
         {
            request: 'put',
            all: 404
         },
         {
            request: 'delete',
            all: 404
         },
         {
            request: 'post',
            all: 404
         }]
      },
      {
         // #/subarticles/{id}/journalist
         endpoint: 'journalist',
         theirResults: [
         {
            request: 'get',
            all: 404
         }],
      },
      {
         // #/subarticles/{id}/upVotes
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
            // #/subarticles/{id}/upVotes/{fk}
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
            // #/subarticles/{id}/upVotes/count
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
      // #/subarticles/count
      endpoint: 'count',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/subarticles/findOne
      endpoint: 'findOne',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/subarticles/update
      endpoint: 'update',
      theirResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};
