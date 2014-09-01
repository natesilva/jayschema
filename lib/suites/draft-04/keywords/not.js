// ******************************************************************
// § 5.5. Validation keywords for any instance type
// ******************************************************************

var Errors = require('../../../errors.js')
  , testRunner = require('../index.js')
  ;

module.exports = function(config) {
  var errors = [];

  var subTestConfig = config.clone();
  subTestConfig.schema = config.schema.not;
  subTestConfig.resolutionScope = config.resolutionScope + '/not';

  if (testRunner(subTestConfig).length === 0) {
    var desc = 'validates against this schema; must NOT validate against ' +
      'this schema';
    errors.push(new Errors.ValidationError(config.resolutionScope,
      config.instanceContext, 'not', config.schema.not, undefined, desc));
  }
  return errors;
};
