module.exports = function(app) {

  var Stat = app.models.Stat;

   //TODO Periodically update the stats object for averageJoe 

   //StaticChange is a boolean that will cause non-timedecayed components
   // to be refreshed as well as the time decayed.
   // An example of its use would be if the rating of a comment on an 
  // article changed then we would want the article to update the 
  // contribution from comments as well
   // In that situation staticChange = true
  Stat.updateRating = function(id, type, modify, cb, staticChange) {
    if(!id || !type) {
      console.log(
        'Error: Either id or type is missing for Article.updateRating');
      cb(new Error('Either id or type is missing for Article.updateRating'));
      return;
    }

    Stat.findById(Stat.averageId, function(err, res) {
      if(err) {
        console.log('Error: Failed to find ' + Stat.averageId);
        cb(err);
      }
      else {
        if(res) {
          var Model;
          if(type === 'article') {
            Model = app.models.Article;
          }
          else if(type === 'subarticle') {
            Model = app.models.Subarticle;
          }
          else if(type === 'comment') {
            Model = app.models.Comment;
          }
          else {
            console.log('Error: Unrecognized type ' + type);
            cb(new Error('Unrecognized type ' + type));
            return;
          }

          var rate = function(mod) {
            return function(stats) {
              return function(res) {
                res = mod(res);
                return Stat.getRating(res, stats);
              };
            };
          };

          Model.updateRating(id, res, rate(modify), cb, staticChange);
        }
        else {
          var message = Stat.averageId + ' was not found!';
          console.log('Error:' + message);
          cb(new Error(message));
        }
      }
    });
  };
};
