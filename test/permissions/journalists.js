
/*
 * This file exports a tests object to be used by test.js
 */

module.exports = {
   //   #/journalists
   endpoint: 'journalists',
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
      all: 422
         /*
      admin: 200,
      guest: 401,
      user: 200
      */
   }],
   children: [
   {
      // #/journalists/{id}
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
         // #/journalists/{id}/accessTokens
         endpoint: 'accessTokens',
         theirResults: [
         {
            request: 'post',
            all: 401
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
            // #/journalists/{id}/accessTokens/{fk}
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
            // #/journalists/{id}/accessTokens/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/journalists/{id}/articles
         endpoint: 'articles',
         theirResults: [
         {
            request: 'post',
            all: 404
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
            // #/journalists/{id}/articles/{fk}
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
            // #/journalists/{id}/articles/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/journalists/{id}/downVotes
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
            // #/journalists/{id}/downVotes/{fk}
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
            // #/journalists/{id}/downVotes/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/journalists/{id}/exists
         endpoint: 'exists',
         theirResults: [
         {
            request: 'get',
            all: 404
         }]
      },
      {
         // #/journalists/{id}/installations
         endpoint: 'installations',
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
            // #/journalists/{id}/installations/{fk}
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
            // #/journalists/{id}/installations/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/journalists/{id}/notifications
         endpoint: 'notifications',
         theirResults: [
         {
            request: 'post',
            all: 404
         },
         {
            request: 'get',
            all: 401
         },
         {
            request: 'delete',
            all: 404
         }],
         /*
         myResults: [
         {
            request: 'get',
            admin: 200,
            user: 200,
            guest: 401
         }],
         */
         children: [
         {
            // #/journalists/{id}/notifications/{fk}
            theirResults: [
            {
               request: 'put',
               all: 401
            },
            {
               request: 'get',
               all: 404
            },
            {
               request: 'delete',
               all: 404
            }],
            /*
            myResults: [
            {
               request: 'put',
               admin: 200,
               user: 200,
               guest: 401
            }]
            */
         },
         {
            // #/journalists/{id}/notifications/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/journalists/{id}/subarticles
         endpoint: 'subarticles',
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
            // #/journalists/{id}/subarticles/{fk}
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
            // #/journalists/{id}/subarticles/count
            endpoint: 'count',
            theirResults: [
            {
               request: 'get',
               all: 404
            }]
         }]
      },
      {
         // #/journalists/{id}/upVotes
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
            // #/journalists/{id}/upVotes/{fk}
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
            // #/journalists/{id}/upVotes/count
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
      // #/journalists/confirm
      endpoint: 'confirm',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/journalists/count
      endpoint: 'count',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   {
      // #/journalists/findOne
      endpoint: 'findOne',
      theirResults: [
      {
         request: 'get',
         all: 404
      }]
   },
   /*
   {
      // #/journalists/logout
      endpoint: 'logout',
      theirResults: [
      {
         request: 'post',
         all: 404
      }],
      myResults: [
      {
         request: 'post',
         admin: 204,
         user: 204,
         guest: 404
      }]
   },
   {
      // #/journalists/login
      endpoint: 'login',
      theirResults: [
      {
         request: 'post',
         all: 404
      }],
      myResults: [
      {
         request: 'post',
         admin: 200,
         user: 200,
         guest: 404
      }]
   },
   */
   {
      // #/journalists/reset
      endpoint: 'reset',
      theirResults: [
      {
         request: 'post',
         all: 404
      }]
   },
   {
      // #/journalists/update
      endpoint: 'update',
      theirResults: [
      {
         request: 'post',
         all: 404
      }]
   }]
};
