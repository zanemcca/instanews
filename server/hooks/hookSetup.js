
module.exports = function(app) {
   //Setup all server side hooks that we need
   require('./view.js')(app);
   require('./installation.js')(app);
   require('./notification.js')(app);
   require('./up-vote.js')(app);
   require('./down-vote.js')(app);
   require('./subarticle.js')(app);
   require('./article.js')(app);
   require('./journalist.js')(app);
   require('./comment.js')(app);
   require('./stat.js')(app);
   require('./click.js')(app);
   require('./base.js')(app);
};
