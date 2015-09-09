
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/articles
   endpoint: 'articles',
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
      // #/articles/{id}
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
         // #/articles/{id}/comments
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
            // #/articles/{id}/comments/{fk}
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
            // #/articles/{id}/comments/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/articles/{id}/downVotes
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
            // #/articles/{id}/downVotes/{fk}
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
            // #/articles/{id}/downVotes/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/articles/{id}/exists
         endpoint: 'exists',
         theirResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/articles/{id}/journalists
         endpoint: 'journalists',
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
            // #/articles/{id}/journalists/{fk}
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
            // #/articles/{id}/journalists/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         },
         {
            // #/articles/{id}/journalists/rel
            endpoint: 'rel',
            children: [
            {
               // #/articles/{id}/journalists/rel/{fk}
               theirResults: [
               {
                  request: 'head',
                  all: 404
               },
               {
                  request: 'delete',
                  all: 404
               },
               {
                  request: 'put',
                  all: 404
               }]
            }]
         }]
      },
      {
         // #/articles/{id}/subarticles
         endpoint: 'subarticles',
         theirResults: [
         {
            request: 'post',
            admin: 200,
            guest: 401,
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
            all: 404
         }],
         children: [
         {
            // #/articles/{id}/subarticles/{fk}
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
            // #/articles/{id}/subarticles/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/articles/{id}/upVotes
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
            // #/articles/{id}/upVotes/{fk}
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
            // #/articles/{id}/upVotes/count
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
      // #/articles/count
      endpoint: 'count',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/articles/findOne
      endpoint: 'findOne',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/articles/update
      endpoint: 'update',
      theirResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};
