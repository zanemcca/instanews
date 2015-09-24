var common = require('../common');
var app = common.app;
var api = common.api;

var destroy = function(inst, cb) {
  //console.log(inst);
  var name = inst.modelName;
  var id = inst.id;
  if(!name) {
    if(inst.userId) {
      name = 'journalist';
      id = inst.userId;
    } else if(inst.clickableId) {
      name = 'click';
    } else {
      name = 'view';
    }
  }

  if( app.models.hasOwnProperty(name)) {
    model = app.models[name];
    model.destroyById(id, cb);
  } else {
    var e = new Error('Failed to find '+ name + ' on app.models');
    e.status = 400;
    return cb(e);
  }
};

function post(url, token, data, cb) {
  //  console.log('\tURL: ' + url);
  //  console.log(data);
  try {
    api.post(url)
    .set('Authorization', token)
    .send(data)
    .expect(200)
    .end( function (err, res) {
      if(err) {
        console.log(err.stack);
        cb(err);
      } else {
        cb(null, res.body);
      }
    });
  } catch(e) {
    console.log(e.stack);
    cb(e);
  }
}

function getUrl(type, parent) {
  var url = '/api/';
  switch (type) {
    case 'subarticle':
      url += 'articles/' + parent.id + '/subarticles';
    break;
    default:
      url += type + 's';
  }
  return url;
}

exports.getUrl = getUrl;
exports.post = post;
exports.destroy = destroy;
