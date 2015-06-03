
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
   type: 'subarticles',
   text: 'blah blah blah'
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
   //noPreCreate: true,
   firstName: 'Tim',
   lastName: 'Henderson',
   email: 'tim@instanews.com',
   username: 'tim',
   password: 'password'
},
{
   type: 'apps',
   name: 'app'
},
{
   type: 'installations',
   noPreCreate: true,
   appId: 1,
   deviceToken: 1,
   deviceType: 'android'
},
{
   type: 'comments',
   content: 'Nuts!',
   commentableType: 'comment',
   date: '2015-02-06T12:48:43.511Z'
}];
