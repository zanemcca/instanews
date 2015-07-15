
/*
var journalists = require('./sample-data/journalist.json');
var comments = require('./sample-data/comment.json');
var articles = require('./sample-data/article.json');
var subarticles = require('./sample-data/subarticle.json');
*/

var app = require('../server/server'); 

var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;
var UpVotes = app.models.upVote;
var DownVotes = app.models.downVote;

function randomLat() {
   max = 46;
   min = 45;
   return Math.random()*(max - min) + min;
}

function randomLng() {
   max = -74;
   min = -73;
   return Math.random()*(max - min) + min;
}

function randomId() {
   var id = Math.floor(Math.random()*Math.pow(2,32));
   return id;
}

function callback(err, res) {
   if( err) {
      console.log('Erorr: ' + err);
   }
   //console.log(res);
}

var fillCount = 0;
var total = 0;
var limit = 200;

function fillArticle(err, res) {
   fillCount++;
   total++;
   Subarticles.create({
      parentId: res.id,
      username: 'bob',
      _file: {
         type: 'image',
         size: 2000,
         name: '123456.jpg',
         caption: 'Nuts photo!!'
      }
   }, callback);


   //console.log('Voting on ' + res.id);
   var max = Math.floor(Math.random()*100);
   for( var i =0; i < max; i++) {
      DownVotes.create({
         votableId: res.id,
         votableType: 'article'
      }, callback);
   }

   max = Math.floor(Math.random()*20);
   for(i =0; i < max; i++) {
      UpVotes.create({
         votableId: res.id,
         votableType: 'article'
      }, callback);
   }
   fillCount--;
   if(total === limit) {
     process.exit(1);
   }
}

console.log('Starting Import');
for( var i = 0; i < limit ; i++ ) {
   Articles.create({
      title: i,
      location: {
         lat: randomLat(),
         lng: randomLng()
      },
      isPrivate: false
   }, fillArticle);
}

console.log('Done Importing!');
