// ******************************************************************
// § 5.5. Validation keywords for any instance type
// ******************************************************************

var Errors = require('../../../errors.js')
  , testRunner = require('../index.js')
  ;

module.exports = function(config) {

  var errors = [];
  for (var index = 0, len = config.schema.anyOf.length; index !== len; ++index)
  {
    var subTestConfig = {
      inst: config.inst,
      schema: config.schema.anyOf[index],
      resolutionScope: config.resolutionScope + '/anyOf/' + index,
      instanceContext: config.instanceContext,
      schemaRegistry: config.schemaRegistry
    };

    var nestedErrors = testRunner(subTestConfig);

    if (nestedErrors.length === 0) {
      return errors;
    }
  }

  errors.push(new Errors.ValidationError(config.resolutionScope,
    config.instanceContext, 'anyOf', config.schema.anyOf, null, 'does not ' +
    'validate against any of these schemas; it must validate against at ' +
    'least one'));

  return errors;
};
