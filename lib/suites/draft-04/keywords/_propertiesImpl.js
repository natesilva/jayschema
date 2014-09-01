// ******************************************************************
// § 5.4. Validation keywords for objects
// ******************************************************************

var Errors = require('../../../errors.js')
  , core = require('../core.js')
  , testRunner = require('../index.js')
  ;

module.exports = function(config) {
  var errors = [];
  var keys, key, index, subTestConfig;

  var p = core.getSchemaProperty(config.schema, 'properties', {});
  var additionalProperties = core.getSchemaProperty(config.schema,
    'additionalProperties', {});

  // for patternProperties, compile RegExps just once
  var pp = [];
  if (Object.prototype.hasOwnProperty.call(config.schema, 'patternProperties'))
  {
    keys = Object.keys(config.schema.patternProperties);
    for (index = 0; index < keys.length; ++index) {
      key = keys[index];
      pp.push([new RegExp(key), config.schema.patternProperties[key]]);
    }
  }

  // for each property, validate against matching property schemas
  keys = Object.keys(config.inst);
  for (var x = 0; x < keys.length; ++x) {
    var m = keys[x];

    var context = config.instanceContext + '/' + m;
    var applyAdditionalProperties = true;

    if (Object.prototype.hasOwnProperty.call(p, m)) {
      subTestConfig = config.clone();
      subTestConfig.inst = config.inst[m];
      subTestConfig.schema = p[m];
      subTestConfig.resolutionScope =
        config.resolutionScope + '/properties/' + m;
      subTestConfig.instanceContext = context;
      errors = errors.concat(testRunner(subTestConfig));
      applyAdditionalProperties = false;
    }

    for (var y = 0; y < pp.length; ++y) {
      var rx = pp[y][0];
      if (m.match(rx)) {
        subTestConfig = config.clone();
        subTestConfig.inst = config.inst[m];
        subTestConfig.schema = pp[y][1];
        subTestConfig.resolutionScope =
          config.resolutionScope + '/patternProperties/' + m;
        subTestConfig.instanceContext = context;
        errors = errors.concat(testRunner(subTestConfig));
        applyAdditionalProperties = false;
      }
    }

    if (applyAdditionalProperties) {
      if (additionalProperties === false) {
        var desc = 'property "' + m + '" not allowed by "properties" or by ' +
          '"patternProperties" and "additionalProperties" is false';
        errors.push(new Errors.ObjectValidationError(config.resolutionScope,
          config.instanceContext, 'additionalProperties', undefined, m, desc));
      } else if (additionalProperties !== true) {
        subTestConfig = config.clone();
        subTestConfig.inst = config.inst[m];
        subTestConfig.schema = additionalProperties;
        subTestConfig.resolutionScope =
          config.resolutionScope + '/additionalProperties';
        subTestConfig.instanceContext = context;
        errors = errors.concat(testRunner(subTestConfig));
      }
    }
  }

  return errors;
};
