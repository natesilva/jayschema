//
// Validation suite for JSON objects against a JSON Schema Draft v4
// schema. Each test returns an array (possibly empty) of errors.
//

'use strict';

var Errors = require('../errors.js')
  ;

// ******************************************************************
// Constructor
// ******************************************************************
var TestSet = function(validationFunction, instance, schema, resolutionScope,
  instanceContext)
{
  this.validate = validationFunction;
  this.inst = instance;
  this.schema = schema;
  this.resolutionScope = resolutionScope;
  this.instanceContext = instanceContext;
};

// ******************************************************************
// [static] Equality as defined in the JSON Schema spec.
// ******************************************************************
TestSet.jsonEqual = function(x, y) {
  var index, len;

  if (Array.isArray(x)) {
    if (!Array.isArray(y)) { return false; }
    if (x.length !== y.length) { return false; }
    for (index = 0, len = x.length; index !== len; ++index) {
      if (!TestSet.jsonEqual(x[index], y[index])) { return false; }
    }
    return true;
  }

  if (typeof x === 'object' && x !== null) {
    if (typeof y !== 'object' || y === null) { return false; }
    var xkeys = Object.keys(x);
    if (xkeys.length !== Object.keys(y).length) { return false; }
    for (index = 0, len = xkeys.length; index !== len; ++index) {
      var key = xkeys[index];
      if (!y.hasOwnProperty(key) || !TestSet.jsonEqual(x[key], y[key])) {
        return false;
      }
    }
    return true;
  }

  return x === y;   // scalar value (boolean, string, number)
};

// ******************************************************************
// [static] Categories of properties we can validate.
// ******************************************************************
TestSet.PROPS_TO_VALIDATE = {
  general: ['enum', 'allOf', 'anyOf', 'oneOf', 'not'],
  array: ['items', 'additionalItems', 'maxItems', 'minItems', 'uniqueItems'],
  number: ['multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
      'exclusiveMinimum'],
  object: ['maxProperties', 'minProperties', 'required',
      'additionalProperties', 'properties', 'patternProperties',
      'dependencies'],
  string: ['maxLength', 'minLength', 'pattern']
};

// ******************************************************************
// [static] Given an instance value, get its apparent primitive
// type.
// ******************************************************************
TestSet.apparentType = function(val) {
  switch (typeof val) {
    case 'boolean':
    case 'string':
      return typeof val;

    case 'number':
      if (val % 1 === 0) { return 'integer'; }
      return 'number';

    default:
      if (val === null) { return 'null'; }
      if (Array.isArray(val)) { return 'array'; }
      return 'object';
  }
};

// ******************************************************************
// Return a set of tests to apply to the instance.
// ******************************************************************
TestSet.prototype.getApplicableTests = function() {
  var result = [];
  var len, i, key;

  // general tests that apply to all types
  for (i = 0, len = TestSet.PROPS_TO_VALIDATE.general.length; i !== len; ++i) {
    key = TestSet.PROPS_TO_VALIDATE.general[i];
    if (this.schema.hasOwnProperty(key)) { result.push(key); }
  }

  // type-specific tests
  var apparentType = TestSet.apparentType(this.inst);
  if (apparentType === 'integer') { apparentType = 'number'; }
  var props = TestSet.PROPS_TO_VALIDATE[apparentType] || [];
  for (i = 0, len = props.length; i !== len; ++i)
  {
    key = props[i];
    if (this.schema.hasOwnProperty(key)) { result.push(key); }
  }

  // for objects, the properties, patternProperties, and
  // additionalProperties validations are inseperable
  if (result.indexOf('properties') !== -1 ||
      result.indexOf('patternProperties') !== -1 ||
      result.indexOf('additionalProperties') !== -1)
  {
    result.push('_propertiesImpl');
  }

  return result;
};

// ******************************************************************
// Run all applicable tests.
// ******************************************************************
TestSet.prototype.run = function() {
  var errors = [];

  // empty schema - bail early
  if (Object.keys(this.schema).length === 0) { return errors; }

  // validate the type: if it isn't valid we can bail early
  errors = errors.concat(this.type());
  if (errors.length) { return errors; }

  // test all applicable schema properties
  var props = this.getApplicableTests();
  for (var index = 0; index < props.length; ++index) {
    var prop = props[index];
    errors = errors.concat(this[prop]());
  }
  return errors;
};

// ******************************************************************
// Helper function to get the value of a schena property.
// ******************************************************************
TestSet.prototype.getSchemaProperty = function(propName, defaultValue) {
  if (this.schema.hasOwnProperty(propName)) {
    return this.schema[propName];
  } else {
    return defaultValue;
  }
};

// ******************************************************************
// § 5.1. Validation keywords for numeric instances
// ******************************************************************

TestSet.prototype.multipleOf = function() {
  var errors = [];
  if (this.inst % this.schema.multipleOf) {
    errors.push(new Errors.NumericValidationError(this.resolutionScope,
      this.instanceContext, 'multipleOf', this.schema.multipleOf, this.inst));
  }
  return errors;
};

TestSet.prototype.maximum = function() {
  var errors = [];
  if (this.inst > this.schema.maximum) {
    errors.push(new Errors.NumericValidationError(this.resolutionScope,
      this.instanceContext, 'maximum', this.schema.maximum, this.inst));
  }
  return errors;
};

TestSet.prototype.exclusiveMaximum = function()
{
  var errors = [];
  if (this.schema.exclusiveMaximum) {
    if (this.inst >= this.schema.maximum) {
      errors.push(new Errors.NumericValidationError(this.resolutionScope,
        this.instanceContext, 'exclusiveMaximum', this.schema.maximum,
        this.inst));
    }
  }
  return errors;
};

TestSet.prototype.minimum = function() {
  var errors = [];
  if (this.inst < this.schema.minimum) {
    errors.push(new Errors.NumericValidationError(this.resolutionScope,
      this.instanceContext, 'minimum', this.schema.minimum, this.inst));
  }
  return errors;
};

TestSet.prototype.exclusiveMinimum = function()
{
  var errors = [];
  if (this.schema.exclusiveMinimum) {
    if (this.inst <= this.schema.minimum) {
      errors.push(new Errors.NumericValidationError(this.resolutionScope,
        this.instanceContext, 'exclusiveMinimum', this.schema.minimum,
        this.inst));
    }
  }
  return errors;
};

// ******************************************************************
// § 5.2. Validation keywords for strings
// ******************************************************************

TestSet.prototype.maxLength = function() {
  var errors = [];
  if (this.inst.length > this.schema.maxLength) {
    errors.push(new Errors.StringValidationError(this.resolutionScope,
      this.instanceContext, 'maxLength', this.schema.maxLength,
      this.inst.length));
  }
  return errors;
};

TestSet.prototype.minLength = function() {
  var errors = [];
  if (this.inst.length < this.schema.minLength) {
    errors.push(new Errors.StringValidationError(this.resolutionScope,
      this.instanceContext, 'minLength', this.schema.minLength,
      this.inst.length));
  }
  return errors;
};

TestSet.prototype.pattern = function() {
  var errors = [];
  if (!this.inst.match(new RegExp(this.schema.pattern))) {
    errors.push(new Errors.StringValidationError(this.resolutionScope,
      this.instanceContext, 'pattern', this.schema.pattern, this.inst));
  }
  return errors;
};

// ******************************************************************
// § 5.3. Validation keywords for arrays
// ******************************************************************

TestSet.prototype.additionalItems = function()
{
  var errors = [];

  // always succeeds in these conditions
  if (this.schema.additionalItems === true ||
      typeof this.schema.additionalItems === 'object' ||
      !this.schema.hasOwnProperty('items') ||
      typeof this.schema.items === 'object' &&
        !Array.isArray(this.schema.items))
  {
    return errors;
  }

  // this.schema.items must be an Array if we’ve reached this point

  if (this.schema.additionalItems === false &&
      this.inst.length > this.schema.items.length)
  {
    var desc = 'array length (' + this.inst.length + ') is greater than ' +
      '"items" length (' + this.schema.items.length + ') and ' +
      '"additionalItems" is false';
    errors.push(new Errors.ArrayValidationError(this.resolutionScope,
      this.instanceContext, 'additionalItems', null, null, desc));
  }

  return errors;
};

TestSet.prototype.items = function() {
  var errors = [];
  var index;

  if (Array.isArray(this.schema.items)) {
    // array of schemas for each item in the array
    var count = Math.min(this.inst.length, this.schema.items.length);
    for (index = 0; index < count; ++index) {
      var item = this.inst[index];
      var itemSchema = this.schema.items[index];
      errors = errors.concat(this.validate(item, itemSchema,
        this.resolutionScope + '/items/' + index,
        this.instanceContext + '/' + index));
    }

    // validate additional items in the array
    if (this.inst.length > this.schema.items.length &&
        this.schema.hasOwnProperty('additionalItems'))
    {
      // If additionalItems is boolean, validation for the
      // additionalItems keyword (above) is all we need. Otherwise,
      // validate each remaining item.
      if (typeof this.schema.additionalItems !== 'boolean') {
        for (index = this.schema.items.length;
             index < this.inst.length;
             ++index)
        {
          errors = errors.concat(this.validate(this.inst[index],
            this.schema.additionalItems,
            this.resolutionScope + '/items/' + index,
            this.instanceContext + '/' + index));
        }
      }
    }

  } else {
    // one schema for all items in the array
    for (index = 0; index < this.inst.length; ++index) {
      var x = this.validate(this.inst[index], this.schema.items,
        this.resolutionScope + '/items',
        this.instanceContext + '/' + index);
      errors = errors.concat(x);
    }
  }

  return errors;
};

TestSet.prototype.maxItems = function() {
  var errors = [];
  if (this.inst.length > this.schema.maxItems) {
    errors.push(new Errors.ArrayValidationError(this.resolutionScope,
      this.instanceContext, 'maxItems', this.schema.maxItems,
      this.inst.length));
  }
  return errors;
};

TestSet.prototype.minItems = function() {
  var errors = [];
  if (this.inst.length < this.schema.minItems) {
    errors.push(new Errors.ArrayValidationError(this.resolutionScope,
      this.instanceContext, 'minItems', this.schema.minItems,
      this.inst.length));
  }
  return errors;
};

TestSet.prototype.uniqueItems = function() {
  var errors = [];

  if (this.schema.uniqueItems === true) {
    for (var x = 0; x < this.inst.length; ++x) {
      var item = this.inst[x];
      for (var y = x + 1; y < this.inst.length; ++y) {
        if (TestSet.jsonEqual(item, this.inst[y])) {
          errors.push(new Errors.ArrayValidationError(this.resolutionScope,
            this.instanceContext, 'uniqueItems', true, null,
            'failed at index ' + x));
          break;
        }
      }
    }
  }

  return errors;
};

// ******************************************************************
// § 5.4. Validation keywords for objects
// ******************************************************************

TestSet.prototype.maxProperties = function()
{
  var errors = [];

  if (Object.keys(this.inst).length > this.schema.maxProperties) {
    errors.push(new Errors.ObjectValidationError(this.resolutionScope,
      this.instanceContext, 'maxProperties', this.schema.maxProperties,
      Object.keys(this.inst).length));
  }

  return errors;
};

TestSet.prototype.minProperties = function()
{
  var errors = [];

  if (Object.keys(this.inst).length < this.schema.minProperties) {
    errors.push(new Errors.ObjectValidationError(this.resolutionScope,
      this.instanceContext, 'minProperties', this.schema.minProperties,
      Object.keys(this.inst).length));
  }

  return errors;
};

TestSet.prototype.required = function() {
  var errors = [];

  var missing = [];
  for (var i = 0, len = this.schema.required.length; i !== len; ++i) {
    var prop = this.schema.required[i];
    if (!this.inst.hasOwnProperty(prop)) { missing.push(prop); }
  }

  if (missing.length) {
    errors.push(new Errors.ObjectValidationError(this.resolutionScope,
      this.instanceContext, 'required', this.schema.required, null,
      'missing: ' + missing));
  }

  return errors;
};

TestSet.prototype._propertiesImpl = function() {
  var errors = [];
  var keys, key, index;

  var p = this.getSchemaProperty('properties', {});
  var additionalProperties = this.getSchemaProperty('additionalProperties', {});

  // for patternProperties, compile RegExps just once
  var pp = [];
  if (this.schema.hasOwnProperty('patternProperties')) {
    keys = Object.keys(this.schema.patternProperties);
    for (index = 0; index < keys.length; ++index) {
      key = keys[index];
      pp.push([new RegExp(key), this.schema.patternProperties[key]]);
    }
  }

  // for each property, validate against matching property schemas
  keys = Object.keys(this.inst);
  for (var x = 0; x < keys.length; ++x) {
    var m = keys[x];

    var context = this.instanceContext + '/' + m;
    var applyAdditionalProperties = true;

    if (p.hasOwnProperty(m)) {
      errors = errors.concat(this.validate(this.inst[m], p[m],
        this.resolutionScope + '/properties/' + m, context));
      applyAdditionalProperties = false;
    }

    for (var y = 0; y < pp.length; ++y) {
      var rx = pp[y][0];
      if (m.match(rx)) {
        errors = errors.concat(this.validate(this.inst[m], pp[y][1],
          this.resolutionScope + '/patternProperties/' + m, context));
        applyAdditionalProperties = false;
      }
    }

    if (applyAdditionalProperties) {
      if (additionalProperties === false) {
        var desc = 'property "' + m + '" not allowed by "properties" or by ' +
          '"patternProperties" and "additionalProperties" is false';
        errors.push(new Errors.ObjectValidationError(this.resolutionScope,
          this.instanceContext, 'additionalProperties', null, m, desc));
      } else if (additionalProperties !== true) {
        errors = errors.concat(this.validate(this.inst[m], additionalProperties,
          this.resolutionScope + '/additionalProperties', context));
      }
    }
  }

  return errors;
};

TestSet.prototype.additionalProperties = function() {
  // no-op (_propertiesImpl will validate this)
  return [];
};

TestSet.prototype.properties = function() {
  // no-op (_propertiesImpl will validate this)
  return [];
};

TestSet.prototype.patternProperties = function() {
  // no-op (_propertiesImpl will validate this)
  return [];
};

TestSet.prototype.dependencies = function() {
  var errors = [];
  var i, prop, len;

  var deps = Object.keys(this.schema.dependencies);

  var depsToApply = [];
  for (i = 0, len = deps.length; i !== len; ++i) {
    prop = deps[i];
    if (this.inst.hasOwnProperty(prop)) { depsToApply.push(prop); }
  }

  for (var index = 0; index < depsToApply.length; ++index) {
    var key = depsToApply[index];
    var dep = this.schema.dependencies[key];

    if (Array.isArray(dep)) {
      // property dependency
      var missing = [];
      for (i = 0, len = dep.length; i !== len; ++i) {
        prop = dep[i];
        if (!this.inst.hasOwnProperty(prop)) { missing.push(prop); }
      }

      if (missing.length) {
        errors.push(new Errors.ObjectValidationError(this.resolutionScope,
          this.instanceContext, 'dependencies', {key: dep}, null,
          'missing: ' + missing));
      }
    } else {
      // schema dependency: validates the *instance*, not the value
      // associated with the property name.
      errors = errors.concat(this.validate(this.inst, dep,
        this.resolutionScope + '/dependencies/' + index,
        this.instanceContext + '/' + key));
    }
  }

  return errors;
};

// ******************************************************************
// § 5.5. Validation keywords for any instance type
// ******************************************************************

TestSet.prototype.type = function() {
  var errors = [];

  if (!this.schema.hasOwnProperty('type')) { return errors; }

  var types = Array.isArray(this.schema.type) ? this.schema.type :
    [this.schema.type];
  var instanceType = TestSet.apparentType(this.inst);

  if (instanceType === 'integer') {
    if (types.indexOf('integer') === -1 && types.indexOf('number') === -1) {
      errors.push(new Errors.ValidationError(this.resolutionScope,
        this.instanceContext, 'type', this.schema.type, instanceType));
    }
  } else {
    // boolean, string, number, null, array, object
    if (types.indexOf(instanceType) === -1) {
      errors.push(new Errors.ValidationError(this.resolutionScope,
        this.instanceContext, 'type', this.schema.type, instanceType));
    }
  }

  return errors;
};

TestSet.prototype['enum'] = function() {
  var errors = [];
  for (var index = 0, len = this.schema['enum'].length; index !== len; ++index)
  {
    if (TestSet.jsonEqual(this.inst, this.schema['enum'][index])) {
      return errors;
    }
  }

  errors.push(new Errors.ValidationError(this.resolutionScope,
    this.instanceContext, 'enum', this.schema['enum'], this.inst));

  return errors;
};

TestSet.prototype.allOf = function() {
  var errors = [];
  for (var index = 0; index < this.schema.allOf.length; ++index) {
    var schema = this.schema.allOf[index];
    errors = errors.concat(this.validate(this.inst, schema,
      this.resolutionScope + '/allOf/' + index, this.instanceContext));
  }
  return errors;
};

TestSet.prototype.anyOf = function() {
  var errors = [];
  for (var index = 0, len = this.schema.anyOf.length; index !== len; ++index) {
    if (this.validate(this.inst, this.schema.anyOf[index],
      this.resolutionScope + '/anyOf/' + index, this.instanceContext)
      .length === 0)
    {
      return errors;
    }
  }

  errors.push(new Errors.ValidationError(this.resolutionScope,
    this.instanceContext, 'anyOf', this.schema.anyOf, null, 'does not ' +
    'validate against any of these schemas; it must validate against at ' +
    'least one'));

  return errors;
};

TestSet.prototype.oneOf = function() {
  var self = this;
  var errors = [], desc;
  var validCount = 0;

  for (var index = 0; index < this.schema.oneOf.length; ++index) {
    var errs = self.validate(this.inst, this.schema.oneOf[index],
      this.resolutionScope + '/oneOf/' + index, this.instanceContext);
    if (errs.length === 0) { validCount++; }
    if (validCount > 1) { break; }
  }

  if (validCount !== 1) {
    if (validCount === 0) {
      desc = 'does not validate against any of these schemas';
    } else {
      desc = 'validates against more than one of these schemas';
    }
    desc += '; must validate against one and only one of them';
    errors.push(new Errors.ValidationError(this.resolutionScope,
      this.instanceContext, 'oneOf', this.schema.oneOf, null, desc));
  }

  return errors;
};

TestSet.prototype.not = function() {
  var errors = [];
  if (this.validate(this.inst, this.schema.not, this.resolutionScope + '/not',
    this.instanceContext).length === 0)
  {
    var desc = 'validates against this schema; must NOT validate against ' +
      'this schema';
    errors.push(new Errors.ValidationError(this.resolutionScope,
      this.instanceContext, 'not', this.schema.not, null, desc));
  }
  return errors;
};

module.exports = TestSet;
