module.exports = function(app) {

  var UpVote = app.models.upVote;
  var Stat = app.models.Stat;
  var mongo = app.dataSources.Articles.connector;
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

  //TODO replicate this for downvotes
  UpVote.observe('after save', function(ctx, next) {
    var inst = ctx.instance;

    if(inst) {
      //The modify function will be done before the rating is calculated
      var modify =  function(instance) {
        instance.upVoteCount++;
        instance.views++;
        instance.clicks++;

        if(instance.modelName === 'article' && !instance.verified &&
          nearBy(inst.location, instance.location)
        ) {
          instance.verified = true;
        }

        var age = Date.now() - instance.date;
        
        //Trigger the user model to update their 
        Stat.addSample(inst.username, 'upVote', 'age', age, function(err, res) {
          if(err) {
            console.log('Error: Failed to add interaction age for upVote');
            console.log(err);
          }
          else {
            Stat.addSample(
              inst.username,
              inst.votableType,
              'age',
              age,
              function(err, res) {
                if(err) {
                  console.log('Error: Failed to add interaction age for ' +
                              inst.votableType);
                  console.log(err);
                }
              }
            );
          }
        });

        return instance;
      };

      Stat.triggerRating({
        id: inst.votableId
      },
      inst.votableType,
      modify,
      function(err, res) {
        if(err) { 
          console.log('Error: Failed to update the rating for ' +
                      inst.votableType + ' - ' + inst.votableId +
                      ' from upvote ' + inst.id);
          next(err);
        }
        else {
          if(res !== 1) {
            console.log('Warning: ' + res + ' ' + inst.votableType +
                        ' were updated for id:' + inst.votableId +
                        ' when there should have been one');
          }
          next();
        }
      }); 
    }
    else {
      console.log('Warning: Invalid instance for upvote!');
    }
  });
};
