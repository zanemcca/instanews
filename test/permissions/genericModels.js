
/*
 * This file contains a basic model of each type to be used in the
 * permission tests
 */

module.exports = [
{
   type: 'articles',
   title: 'Boring article',
   isPrivate: false,
   date: '2015-02-10T12:48:43.511Z',
   location:{
      lat: 45.61950,
      lng: -65.45772
   }
},
{
   type: 'downVotes',
   votableType: 'comment'
},
{
   type: 'upVotes',
   votableType: 'comment'
},
{
   type: 'journalists',
   firstName: 'Jane',
   lastName: 'Henderson',
   email: 'jane@instanews.com',
   username: 'jane',
   password: 'password'
},
{
   type: 'apps',
   name: 'app'
},
{
   type: 'comments',
   content: 'Nuts!',
   commentableType: 'comment',
   date: '2015-02-06T12:48:43.511Z'
}];
