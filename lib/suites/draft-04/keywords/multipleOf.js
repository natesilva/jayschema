// ******************************************************************
// § 5.1. Validation keywords for numeric instances
// ******************************************************************

var Errors = require('../../../errors.js');

module.exports = function(config) {
  var errors = [];
  if (config.inst % config.schema.multipleOf) {
    errors.push(new Errors.NumericValidationError(config.resolutionScope,
      config.instanceContext, 'multipleOf', config.schema.multipleOf,
      config.inst));
  }
  return errors;
};
