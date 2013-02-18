//
// JaySchema (draft v4) validator for Node.js.
//

'use strict';

var Errors = require('./errors.js')
  , crypto = require('crypto')
  , SchemaRegistry = require('./schemaRegistry.js')
  , uri = require('./uri.js')
  ;


var DEFAULT_SCHEMA_VERSION = 'http://json-schema.org/draft-04/schema#';
var ANON_URI_SCHEME = 'anon-schema';

var testRunners = {
  'http://json-schema.org/draft-04/schema#': require('./suites/draft-04')
};

// ******************************************************************
// Constructor
// ******************************************************************
var JaySchema = function(loader) {
  // public
  this.maxRecursion = 5;
  this.loader = (typeof loader === 'function') ? loader : null;

  // internal
  this._schemaRegistry = new SchemaRegistry();
  this._refsRequested = [];
};

// ******************************************************************
// [static] Pre-defined schema loaders (can be passed to the
// constructor)
// ******************************************************************
JaySchema.loaders = {
  http: require('./httpLoader.js')
};

JaySchema.errors = Errors;

// ******************************************************************
// Get an array of $refs for which we don’t have a schema yet.
// ******************************************************************
JaySchema.prototype.getMissingSchemas = function() {
  return this._schemaRegistry.getMissingSchemas();
};

// ******************************************************************
// Register a schema.
// ******************************************************************
JaySchema.prototype.register = function() {
  return this._schemaRegistry.register.apply(this._schemaRegistry, arguments);
};

// ******************************************************************
// [static] Return a hash for an object. We rely on JSON.stringify
// to always return the same value for a given object. (If it
// doesn’t return the same value, the parser will be somewhat slower
// and use more memory. It does seem to always return the same
// value based on observation and on Ecma-262 5.1 § 15.12.3.)
// ******************************************************************
JaySchema._getObjectHash = function(obj) {
  var shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(obj));
  return shasum.digest('hex');
};

// ******************************************************************
// Helper to call the user-provided schema loader.
// ******************************************************************
JaySchema.prototype._loadMissingRefs = function(depth, callback) {
  var err;
  var missing = this._schemaRegistry.getMissingSchemas();

  // try not to request the same ref more than once
  missing = missing.filter(function(ref) {
    if (this._schemaRegistry.isRegistered(ref)) { return false; }
    if (this._refsRequested.indexOf(ref) !== -1) { return false; }
    return true;
  }, this);

  if (!missing.length) { return process.nextTick(callback); }

  // are we in too deep?
  if (!depth) {
    var desc = 'would exceed max recursion depth fetching these referenced ' +
      'schemas (set the maxRecursion property if you need to go deeper): ' +
      missing;
    err = new Errors.ValidationError(null, null, null, null, null,
      desc);
    return process.nextTick(callback.bind(null, err));
  }

  // fetch 'em
  var completedCount = 0;
  var totalCount = missing.length;
  err = null;

  var loaderCallback = function(ref, loaderErr, schema) {
    if (loaderErr) { err = loaderErr; }
    else { this.register(schema, ref); }

    completedCount++;
    if (completedCount === totalCount) {
      if (err) {
        callback(err);
      } else {
        this._loadMissingRefs(depth - 1, function(err) { callback(err); });
      }
    }
  };

  for (var index = 0, len = missing.length; index !== len; ++index) {
    var ref = missing[index];
    this._refsRequested.push(ref);
    this.loader(ref, loaderCallback.bind(this, ref));
  }

};

// ******************************************************************
// The main validation guts (internal implementation).
// ******************************************************************
JaySchema.prototype._validateImpl = function(instance, schema, resolutionScope,
  instanceContext)
{
  // for schemas that have no id, use an internal anonymous id
  var schemaId = schema.id || resolutionScope ||
    ANON_URI_SCHEME + '://' + JaySchema._getObjectHash(schema) + '/#';

  if (!this._schemaRegistry.isRegistered(schemaId)) {
    this.register(schema, schemaId, resolutionScope);
  }
  resolutionScope = resolutionScope || schemaId;
  if (resolutionScope.indexOf('#') === -1) { resolutionScope += '#'; }

  // no schema passed
  if (!schema) { return [];}

  // run the tests
  var config = {
    inst: instance,
    schema: schema,
    resolutionScope: resolutionScope,
    instanceContext: instanceContext || '#',
    schemaRegistry: this._schemaRegistry
  };

  var testRunner = testRunners[schema.$schema || DEFAULT_SCHEMA_VERSION];
  return testRunner(config);
};

// ******************************************************************
// The main validation function (public API). Our raison d'être.
// ******************************************************************
JaySchema.prototype.validate = function(instance, schema, callback)
{
  // for schemas that have no id, use an internal anonymous id
  var schemaId = schema.id || ANON_URI_SCHEME + '://' +
    JaySchema._getObjectHash(schema) + '/#';
  this.register(schema, schemaId);

  if (callback) {

    var self = this;
    var result;

    if (self.loader) {

      // If the user provided a loader callback, load all unresolved
      // $references schemas at this time.
      self._loadMissingRefs(self.maxRecursion, function(err) {
        if (err) { return callback(err); }
        result = self._validateImpl(instance, schema);
        if (result.length) { callback(result); }
        else { callback(); }
      });

    } else {
      // no loader, but user still wants a callback
      result = this._validateImpl(instance, schema);
      if (result.length) { process.nextTick(callback.bind(null, result)); }
      else { process.nextTick(callback); }
    }

  } else {

    // traditional, non-callback validation
    var errs = [];

    if (this.loader) {
      var desc = 'You provided a loader callback, but you are calling ' +
        'validate() synchronously. Your loader will be ignored and ' +
        'validation will fail if any missing $refs are encountered.';
      var err = new Errors.LoaderError(null, null, null, null, null,
        desc);
      errs.push(err);
    }

    errs = errs.concat(this._validateImpl(instance, schema));
    return errs;
  }
};

module.exports = JaySchema;
