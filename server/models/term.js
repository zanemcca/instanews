module.exports = function(Term) {

  Term.term = {
    version: 1,
    text: 'Here are some terms and conditions'
  };

  Term.policy = {
    version: 2,
    text: 'Here is a Privacy Policy'
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
