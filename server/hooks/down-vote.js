module.exports = function(app) {

  var mongo = app.dataSources.Articles.connector;

   var DownVote = app.models.downVote;

   DownVote.observe('after save', function(ctx, next) {

     mongo.collection(ctx.instance.votableType).findAndModify({
       _id: ctx.instance.votableId
     },
     [['_id', 'asc']],
     { $inc: { downVoteCount: 1 }},
     {
       new: true
     },
     function(err, object){
       if (err) {
          console.log('Error: ' + err);
          next(err);
       }
       else {
          next();
       }
     });
   });
};
