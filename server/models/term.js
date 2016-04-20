module.exports = function(Term) {

  var fs = require('fs');

  Term.term = {
    version: 1,
    text: fs.readFileSync(__dirname + '/../public/TermsOfService.html', 'utf8')
  };

  Term.policy = {
    version: 2,
    text: fs.readFileSync(__dirname + '/../public/PrivacyPolicy.html', 'utf8')
  };

  Term.terms = function (cb) {
    cb(null, Term.term);
  };

  Term.remoteMethod(
    'terms',
    { 
      http: {
        path: '/', verb: 'get'
      },
      description: 'Returns the latest Terms of Service',
      returns: { arg: 'terms', type: 'object'}
    }
  );

  Term.privacy = function (cb) {
    cb(null, Term.policy);
  };

  Term.remoteMethod(
    'privacy',
    { 
      http: {
        path: '/privacy', verb: 'get'
      },
      description: 'Returns the latest Privacy Policy',
      returns: { arg: 'policy', type: 'object'}
    }
  );
};
