
exports.config = {
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'mobileEmulation' : {
        'deviceName': 'Google Nexus 6'
        //'deviceName': 'iPhone 6 Plus'
      }
    }
  },
  jasminNodeOpts: {
    showColors: true
  },
  specs: ['spec/**/*.js']
};
