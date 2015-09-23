
var common = require('../common');
var app = common.app;
var api = common.api;

var Models = {
  article: ['subarticle', 'comment', 'view', 'click', 'upVote', 'downVote'],
  subarticle: ['comment', 'view', 'click', 'upVote', 'downVote'],
  comment: ['comment', 'view', 'click', 'upVote', 'downVote'],
  view: ['click', 'upVote', 'downVote'],
  click: [],
  upVote: [],
  downVote: []
};

var CoDependencies = {
  article: ['view'],
  subarticle: ['view'],
  comment: ['view'],
};

var PreDependencies = {
  subarticle: ['view'],
  comment: ['view'],
  click: ['view'],
  upVote: ['view'],
  downVote: ['view']
};

var samples = {
  comment: function (parent) {
    return {
      content: common.generate.randomString(Math.floor(Math.random()*40)),
      commentableType: parent.modelName,
      commentableId: parent.id 
    };
  },
  view: function (parent) {
    return {
      viewableId: parent.id,
      viewableType: parent.modelName
    };
  },
  click: function (parent) {
    return {
      clickableId: parent.id,
      clickableType: parent.modelName
    };
  },
  upVote: function (parent) {
    return {
      clickableId: parent.id,
      clickableType: parent.modelName
    };
  },
  downVote: function (parent) {
    return {
      clickableId: parent.id,
      clickableType: parent.modelName
    };
  },
  article: function () {
    return {
      title: common.generate.randomString(),
      isPrivate: false,
      location: common.generate.randomLocation() 
    };
  },
  subarticle: function (parent) {
    return {
      text: common.generate.randomString(Math.floor(Math.random()*500)),
      parentId: parent.id
    };
  },
  journalist: function (name) {
    return {
      password: common.generate.randomString(),
      username: name,
      email: name + '@mail.com'
    };
  }
};

// Parents is an inverted form of Models
var Parents = {};
for(var type of Object.getOwnPropertyNames(Models)) {
  var children = Models[type];
  for(var child of children) {
    // Build the reverse Model tree
    if(Parents.hasOwnProperty(child)) {
      if(!Parents[child].hasOwnProperty(type)) {
        Parents[child].push(type);
      }
    } else {
      Parents[child] = [type];
    }
  }
}

function getModelInstance(type, arg) {
  if(samples.hasOwnProperty(type)) {
    return samples[type](arg);
  } else {
    console.log('Type: ' + type +'\tArg: ' + arg);
    var e = new Error('WTF Thats not a valid type!');
    console.log(e);
  }
}

exports.models = Models;
exports.preDependencies = PreDependencies;
exports.parents = Parents;
exports.getModelInstance = getModelInstance;
