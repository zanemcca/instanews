module.exports = function(app) {

   // Conversion functions
   Number.prototype.toRad = function() {
      return this * Math.PI / 180;
   };

   var nearBy = function(loc1, loc2) {

      if(loc1 && loc2) {
         //haversine method
         var lat1 = loc1.lat.toRad();
         var lat2 = loc2.lat.toRad();
         var dLat = (loc1.lat - loc2.lat).toRad();
         var dLng = (loc1.lng - loc2.lng).toRad();

         var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
         var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
         //Earths radius is 6371Km

         //Return true if the two locations are within 500 meters of eachother
         return (6371000 * c <= 500);
      }
      else {
         return false;
      }
   };

   var UpVote = app.models.upVote;

   UpVote.observe('after save', function(ctx, next) {


      ctx.instance.__get__votable( function(err, instance) {
         if(err) {
            console.log('Error: ' + err);
            next(err);
         }
         else {
            if(instance.modelName === 'article') {
               instance.verified = nearBy(
                  ctx.instance.location,
                  instance.location);
            }

            instance.upVoteCount += 1;
            instance.save( function(err, res) {
               if (err) {
                  console.log('Error: ' + err);
                  next(err);
               }
               else {
                  ctx.instance.upVoteCount = instance.upVoteCount;
                  ctx.instance.rating = res.rating;
                  if(instance.modelName === 'article') {
                     ctx.instance.verified = instance.verified;
                  }
                  next();
               }
            });
         }
      });

      /*
      var Model;

      var isArticle = false;
      //console.log('Upvote !!!!!');
      switch(ctx.instance.votableType) {
         case 'article':
            Model = app.models.Article;
            isArticle = true;
            break;
         case 'subarticle':
            Model = app.models.Subarticle;
            break;
         case 'comment':
            Model = app.models.Comment;
            break;
         default:
            console.log('Error: bad votableType');
            next();
      }

      Model.findOne({
         where: {
            id: ctx.instance.votableId
         }
      }, function(err, instance) {
         if(isArticle) {
            instance.verified = nearBy(
               ctx.instance.location,
               instance.location);
         }

         /* jshint camelcase: false */
/*
         if (err) console.log('Error: ' + err);
         instance.__count__upVotes( function(err, res) {
            instance.upVoteCount = res;
            //console.log('Up Count: ' + res);
            instance.save( function(err, res) {
               if (err) console.log('Error: ' + err);
               ctx.instance.upVoteCount = instance.upVoteCount;
               ctx.instance.rating = res.rating;
               if(isArticle) {
                  ctx.instance.verified = instance.verified;
               }
               next();
            });
         });
      });
      */
   });

};
