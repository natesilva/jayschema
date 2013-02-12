// ******************************************************************
// § 5.4. Validation keywords for objects
// ******************************************************************

var Errors = require('../../../errors.js');

module.exports = function(config) {
  var errors = [];

  var missing = [];
  for (var i = 0, len = config.schema.required.length; i !== len; ++i) {
    var prop = config.schema.required[i];
    if (!config.inst.hasOwnProperty(prop)) { missing.push(prop); }
  }

  if (missing.length) {
    errors.push(new Errors.ObjectValidationError(config.resolutionScope,
      config.instanceContext, 'required', config.schema.required, null,
      'missing: ' + missing));
  }

  return errors;
};
