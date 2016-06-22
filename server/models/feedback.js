module.exports = function(Feedback) {

  Feedback.submit = function (content, cb) {
    Feedback.app.email.send({
      to: 'support@instanews.com',
      subject: 'Feedback',
      text: content,
      from: 'feedback@instanews.com'
    }, cb);
  };

  Feedback.remoteMethod(
    'submit',
    { 
      accepts: { arg: 'content', type: 'string', required: true},
      http: {
        path: '/', verb: 'put'
      },
      description: 'Submits feedback to helpdesk'
    }
  );

};
