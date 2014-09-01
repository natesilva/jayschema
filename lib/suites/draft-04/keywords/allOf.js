// ******************************************************************
// § 5.5. Validation keywords for any instance type
// ******************************************************************

var testRunner = require('../index.js')
  ;

module.exports = function(config) {
  var errors = [];
  for (var index = 0; index < config.schema.allOf.length; ++index) {
    var schema = config.schema.allOf[index];

    var subTestConfig = config.clone();
    subTestConfig.schema = schema;
    subTestConfig.resolutionScope = config.resolutionScope + '/allOf/' + index;

    errors = errors.concat(testRunner(subTestConfig));
  }
  return errors;
};
