var sharedIEConfig = require('../shared/karma-ie.conf.js');

module.exports = function(config){

  var file = ['../../test-karma/socket-test.js'];

  sharedIEConfig(config);

  config.files = config.files.concat(file);
  
}