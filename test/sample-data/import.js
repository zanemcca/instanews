
var app = require('../../server/server'); 

var Articles = app.models.Article;
var Subarticles = app.models.Subarticle;
var UpVotes = app.models.upVote;
var DownVotes = app.models.downVote;

function randomLat() {
   max = 45.52;
   min = 45.51;
   return Math.random()*(max - min) + min;
}

function randomLng() {
   max = -73.56;
   min = -73.57;
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
   cbCount++;
   if(cbCount === totalCB) {
     next();
   }
}

function purge(cb) {
  var error;
  Articles.destroyAll(function(err) {
    if(!error && err) error = err;
    Subarticles.destroyAll(function(err) {
      if(!error && err) error = err;
      UpVotes.destroyAll(function(err) {
        if(!error && err) error = err;
        DownVotes.destroyAll(function(err) {
          if(!error && err) error = err;
          cb(error);
        });
      });
    });
  });
}

var limit = 200;
var count = 0;
var cbCount = 0;
var totalCB = 0;

function fillArticle(err, res) {
   upMax = Math.floor(Math.random()*50);
   downMax = Math.floor(Math.random()*50);
   totalCB = upMax + downMax + 1;
   cbCount = 0;

   Subarticles.create({
      parentId: res.id,
      username: 'bob',
      text: 'This is a subarticle for ' + res.title,
   }, callback);

   console.log('Created: ' + res.title + ', up: ' + upMax + ', down: ' + downMax);
   for( var i =0; i < downMax; i++) {
      DownVotes.create({
         votableId: res.id,
         votableType: 'article'
      }, callback);
   }

   for(i =0; i < upMax; i++) {
      UpVotes.create({
         votableId: res.id,
         votableType: 'article'
      }, callback);
   }
}

var next = function() {
  count++;
  if( count <= limit) {
   Articles.create({
      title: count,
      location: {
         lat: randomLat(),
         lng: randomLng()
      },
      isPrivate: false
   }, fillArticle);
  }
  else {
    console.log('Finished import');
    process.exit(1);
  }
};

console.log('Starting Import');
purge( function(err) {
  if(err) {
    console.log('Error: Failed to purge DB: ' + JSON.stringify(err));
  }
  next();
});
